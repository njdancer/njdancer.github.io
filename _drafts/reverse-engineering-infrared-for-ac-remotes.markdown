---
title: Reverse Engineering Infrared for AC Remotes
layout: post
---

I was going through my home recently looking for options to make my existing appliances a bit smarter. Our remote controlled air conditioner stood out because its something that can take several minutes to effectively cool/heat a room. It can also be quite costly to run so ensuring this only runs when necessary could also save money off my electricity bill. In order for this to work, I would need to find a way to interface with the AC. Short of cracking open the AC unit(which I can’t do in a rental) my only real option was to reverse engineer the infrared remote control that it comes with.

## Some Background on Infrared

Before we dive into this process, It’s worthwhile covering some background information on infrared or IR as we’ll refer to it. IR is a specific wavelength(or range of wavelengths) of electromagnetic radiation that is just beneath visible light on the electromagnetic spectrum. This means that despite it not being visible to the human eye it behaves exactly as we would expect visible light to. This also means that transmitting and receiving IR is simply a matter of having an LED and some kind of photosensor tuned for IR wavelengths.

Now, where things start to get a little more complex is when sending data over IR. A single IR LED is fine for transmitting IR but effectively serves as a single bit(0 or 1 - off or on). You may think the solution is just to add more LED’s, each with a matching photosensor, but light isn't that simple. In order for the remote to have the greatest range it will be designed to send IR in as many directions as possible meaning the light from each LED is unlikely to be detected by only its corresponding sensor. Other devices with complex photosensors(eg digital cameras) generally solve this through optical lenses however for a remote this would only serve to limit the range and is unlikely to allow for multiple LED’s as you would then require precise alignment with the sensor. This is essentially the purpose of optical fiber in fibre-optic communications.

So, if we can't send multiple bits in parallel we need some way to send them in serial. The solution to this is [modulation](https://en.wikipedia.org/wiki/Modulation). If you think you've heard the term modulation before you're probably right. Amplitude modulation and frequency modulation are two very common methods used for radio. More commonly referred to as AM and FM. This is also the origin of the term [modem][2]. But what is modulation?

> modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.
> – [Wikipedia][1]

Essentially by varying the waveform from its standard shape(carrier wave) we can encode data in it. A receiver can then look at these deviations from the carrier wave and calculate what the original modulating signal was. Simple? Maybe not. Don't worry. Let's look at a specific modulation technique to make things clearer.

## Pulse Position Modulation

That may seem like a mouthful but PPM(more specifically differential PPM) as we'll refer to it is the standard technique for modulating data into an IR signal. This works by sending a series of pulses(signal high) with differently spaced gaps(signal low) between them. Depending on the length of the gap this will be interpreted as either a 1 or a 0. So to send data over IR we just modify the emitted waveform so that the troughs represent a 1 or a 0. Right? Not quite.

Again, this is light we're dealing with. By modifying the waveform and subsequently frequency we are actually changing the colour away from IR. To avoid interference IR receivers are usually limited to a fairly narrow bandwidth. Further to this, IR is everywhere, as most things lose heat through IR. Including your own body. Then, how can our receiver differentiate between environmental IR and our transmitted signal? Well, rather then using the IR waveform as our carrier wave we actually use an artificial pulse wave at 38kHz. Other frequencies may be used however 38kHz is quite popular as IR at this frequency occurs very rarely in nature. This gives our receiver an easy way to seperate the signal we're transmitting from everything else.

So, to put this all together, when your remote sends a signal it turns its IR LED on and off 38,000 times every second. Periodically, it will turn this LED off for a certain period of time to represent a bit of data. The receiver at the same time is constantly looking for a 38kHz IR wave. When it detects the signal from the remote it will wait for any gaps in the signal and will record the length of every gap in this signal. Depending on the length of the gap we can take each bit to be either a 0 or a 1 at which point we have now reconstructed the originally transmitted message.

## Putting it all into practice

Now that we’ve made it this far we can finally build something to put this knowledge to good use and one of the easiest platforms to get started with is Arduino. For those who aren't familiar with Arduino, a thorough explanation is outside the scope of this article and there are plenty of great resources out there already. Suffice it to say though, Arduino is an open source platform for building embedded devices. This includes designs for prototype boards, a development environment(IDE) and thanks to the community a large number of libraries to support nearly anything you could imagine. For this article I've actually ended up using a nodeMCU development board but thanks again to the community this is completely compatible with the Arduino IDE and for this article, the distinction should be fairly meaningless.

{% include image.html name="nodemcu-arduino-comparison.png" caption="NodeMCU(Left) and Arduino Uno(Right)" %}

After we have the microcontroller this is all going to run on we next need the IR receiver. You may be asking yourself whether this is any different to the photosensor we were mentioning earlier. A photosensor is simply designed to absorb light and convert it to electrical energy that can be measured. This would still require something to isolate the 38kHz wave so that you can measure the pulse positions. This is a where a receiver simplifies things a little bit. A receiver will usually have additional hardware embedded which will isolate the wave for us and emit a signal whenever the wave is detected. This makes wiring a simple matter of connecting ground to ground, Vcc to 3.3v, and the signal pin to an available pin on the Arduino. In this image we've used D5 which corresponds to pin 14 for our board.

{% include image.html name="nodemcu-ir-receiver-bread.png" caption="Breadboard diagram for ESP8266 and IR receiver" %}

The final piece of the puzzle is some software to process this input. We’ll split this into two pieces. The first piece will be some code that runs on the Arduino to process the IR input and report the pulse timings over serial. The second piece will capture the pulse timings and present them in a format that is easier to interpret. Thanks to the open source community this is made quite a bit easier.

For the Arduino, there is a library called [IRRemote](https://github.com/z3t0/Arduino-IRremote) that will simplify our first task. This library is incompatible with the ESP8266 but fortunately this has been solved by a fork named [IRRemoteESP8266](https://github.com/markszabo/IRremoteESP8266). After following their installation instructions we can, inside the Arduino IDE, go to File > Examples > IRremote > IRrecvDumpV2 to load the sketch we need for our firmware.

At this point with our Arduino connected we can hit the upload button in the Arduino IDE and the sketch will be compiled and uploaded. We can then open the serial monitor and try and capture a signal. If everything is working any IR commands in range of the receiver should be recorded, decoded and printed to the serial monitor.

{% include image.html name="serial-output.png" caption="Arduino serial output" %}

## Interpreting the data
I mentioned previously that we would need two pieces of software. We have uploaded the required software to the Arduino but there is some processing we can do that will make it easier to interpret the data. Once again, this is made easier by contributions from the community. Specifically the authors of [IRRemoteESP8266](https://github.com/markszabo/IRremoteESP8266) have written a [python script](https://github.com/markszabo/IRremoteESP8266/blob/master/tools/auto_analyse_raw_data.py) to process the raw data provided by the arduino. If we close the serial monitor we can instead access this data through the terminal by running the following command.

```bash
SERIAL_PORT=/dev/cu.wchusbserial1410; stty -f "$SERIAL_PORT" 115200|grep -a --line-buffered rawData "$SERIAL_PORT"|tr -u '\n' '\0'|xargs -0 -n1 python auto_analyse_raw_data.py
```

If we run this command inside a terminal we should find we can send IR commands to the Arduino and have the data analysed. The analysis will be printed to the terminal window allowing us to understand what is being sent.

{% include image.html name="IR-data-analysis.mp4" caption="terminal output" %}

We can now finally map these bits of data to commands on our remote. This stage will vary greatly depending on your remote and is largely a matter of trial and error. There are however a few tips I can share that may make this easier.

The easiest bits to find first are any that represent functinality that can be either on or off. Power is a great example of this and the following image shows our payload oscilating between these two states.

###image - power analyisis oscillating

Slightly more difficult is any feature that has multiple states. We can see in the below image as we change the temperature which has a range of 16 - 30, multiple bits are changing over time. Those who have experience with binary arithmetic may notice that this is actually a 4 bit integer. You may also notice that this integer(and ultimately the entire stream) has had its LSB(least significant bit) sent first. This is something we will need to know when reconstructing the signal.

Through trial and error we can change settings on the remote and slowly map different functionality to different bits in our stream. However one common feature may confuse you. You may have noticed some bits that change with multiple commands. It is very common for these streams to have some kind of checksum. These are bits that don't contain any new data but rather data that validates other bits and that none of these bits have been interfered with during transmission.

With the timing data and bit mapping available we now have enough information to be able to reconstruct these signal's and we have successfully accomplished our goal.

With all this said we should now have enough information to




[1]:https://en.wikipedia.org/wiki/Modulation
[2]:https://en.wikipedia.org/wiki/Modem
