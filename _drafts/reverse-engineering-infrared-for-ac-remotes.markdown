---
title: Reverse Engineering Infrared for AC Remotes
layout: post
---

I was going through my home recently looking for options to make my existing appliances a bit smarter. Our remote controlled air conditioner stood out because its something that can take several minutes to effectively cool/heat a room. It can also be quite costly to run so ensuring this only runs when necessary could also save money off my electricity bill. In order for this to work, I would need to find a way to interface with the AC. I know it uses Infrared like most remote controls but further details of the protocol were unavailable. The only option left was to reverse engineer the remote that came with the unit.

## Some Background on Infrared

Before we dive into this process, It’s worthwhile covering some background information on infrared or IR as we’ll refer to it. IR is a specific wavelength(or range of wavelengths) of electromagnetic radiation that is just beneath visible light on the electromagnetic spectrum. This means that despite it not being visible to the human eye it behaves exactly as we would expect visible light to. This also means that transmitting and receiving IR is simply a matter of having an LED and some kind of photosensor both tuned for IR wavelengths.

{:.fullwidth}
{% include image.html name="spectrum.svg" %}

Now, things start to get a little more complex when sending data over IR. A single IR LED is fine for transmitting IR but effectively serves as a single bit(0 or 1 — off or on). You may think the solution is just to add more LED’s, each paired with a matching photosensor, but light isn't that simple. In order for the remote to have the greatest range it will be designed to send IR in as many directions as possible meaning. Therefore, the light from each LED is unlikely to be detected by only its paired sensor. Other devices with complex photosensors(e.g. digital cameras) generally solve this by using optical lenses. For a remote however, this would only serve to limit the range and is unlikely to allow for multiple LED’s as, you would then require precise alignment with the sensor. This is essentially the purpose of optical fibre in fibre-optic communications.

So, if we can't send multiple bits in parallel we need a way to send them in serial. The solution to this is [modulation][1]. If you think you've heard the term modulation before, you probably have. Amplitude modulation and frequency modulation are two very common methods used for radio. More commonly referred to as AM and FM. This is also the origin of the term [modem][2]. But what is modulation?

> Modulation is the process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that typically contains information to be transmitted.
> – [Wikipedia][1]

Essentially, we start with a consistent carrier signal and vary its shape to encode data in it. A receiver can then look at these deviations from the carrier signal and calculate what the original modulating signal was. Light has its own natural waveform like all electromagnetic radiation but, IR is everywhere, as most things lose heat through IR, including your own body. Using it as a carrier signal would open us up to lots of interference. Instead we will need to create our own carrier signal that can be easily isolated from the noisy environment and use a suitable modulation technique to encode data in it.

## Pulse Position Modulation

That may seem like a mouthful but PPM(more specifically differential PPM) as we'll refer to it is the standard technique for modulating data into an IR signal. This starts with a pulse wave as our carrier signal. Then to modulate this signal with a bit of data we momentarily disable the pulse wave. The length this is disabled for determines whether that bit is a 0 or a 1. The pulse wave we'll be using will be at 38 kHz which is somewhat of a standard for this method. This is very unlikely to occur in nature which means this signal should be easy to isolate avoiding any environmental interference.

{:.fullwidth}
{% include image.html name="ppm.svg" %}

Put more simply, when your remote sends a signal it turns its IR LED on and off 38,000 times every second. Periodically, it will turn this LED off for a certain period of time to represent a bit of data. The receiver at the same time is constantly looking for a 38 kHz IR wave. When it detects the signal from the remote it will wait for any spaces in the signal and will record the length of every space in this signal. Depending on the length of the space we can take each bit to be either a 0 or a 1 at which point we have now reconstructed the originally transmitted message.

## Putting it all into practice

To put this knowledge to good use we should start by selecting a micro-controller. For this project I'll be using an ESP8266(specifically NodeMCU v1.0) and the Arduino IDE. For those who aren't familiar with Arduino, a thorough explanation is outside the scope of this article and there are plenty of great resources out there already. Suffice it to say though, Arduino is an open source platform for building embedded devices. This includes designs for prototype boards, a development environment(IDE) and thanks to the community a large number of libraries to support nearly anything you could imagine. This also means these instructions should work with few modifications on most Arduino compatible micro-controllers.

{% include image.html name="nodemcu-arduino-comparison.png" caption="NodeMCU(Left) and Arduino Uno(Right)" %}

After we have our micro-controller, we next need the IR receiver. You may be asking yourself whether this is any different to the photosensor we were mentioning earlier. A photosensor is simply designed to absorb light and convert it to electrical energy that can be measured. This would still require something to isolate the 38 kHz wave so that you can measure the pulse positions. This is where a receiver simplifies things a little bit. A receiver will usually have additional hardware embedded which will isolate the wave for us and emit a signal whenever the wave is detected. This makes wiring a simple matter of connecting ground to ground, Vcc to 3.3v, and the signal pin to an available pin on the Arduino. In this image we've used D5 on the NodeMCU which corresponds to pin 14 for our micro-controller.

{% include image.html name="nodemcu-ir-receiver-bread.png" caption="Breadboard Diagram for NodeMCU and IR Receiver" %}

The final piece of the puzzle is some software to process this input. We’ll split this into two pieces. The first piece is the firmware that runs on the micro-controller to process the IR input and report the pulse timings over serial. For this, there is a library called [IRRemote][3] that will do what we need. This library is incompatible with the ESP8266 but fortunately this has been solved by a fork named [IRRemoteESP8266][4]. After following their installation instructions we can, inside the Arduino IDE, go to File > Examples > IRremote > IRrecvDumpV2 to load the sketch we need.

At this point with our micro-controller connected we can hit the upload button in the Arduino IDE and the sketch will be compiled and uploaded. We can then open the Serial Monitor and try to capture a signal. If everything is working, any IR signal in range of the receiver should be recorded, decoded, and printed to the serial monitor.

{% include image.html name="serial-output.png" caption="Arduino IDE - Serial Monitor" %}

Now that we can see the command data, you may think we have all we need and we could actually stop here. To help understand the command data, however, there is some analysis that we can perform on it. The authors of [IRRemoteESP8266][4] have written a [python script][5] to process the raw data provided by the micro-controller that we can run from the Terminal app. After closing the serial monitor we can open a terminal window to the same folder we have downloaded this script and run the following command. Bear in mind you will need to adjust the SERIAL_PORT at the beginning to match your setup.

```bash
SERIAL_PORT=/dev/cu.wchusbserial1410; stty -f "$SERIAL_PORT" 115200|grep -a --line-buffered rawData "$SERIAL_PORT"|tr -u '\n' '\0'|xargs -0 -n1 python auto_analyse_raw_data.py
```

This analysis gives us a few important bits of information that will be required to eventually reimplement this protocol ourselves. Firstly we should take note of the timing information. The analysis will show any potential timing candidates for both marks and spaces, as well as offer suggestions for what particular parts of the command use what timing. We can also see the individual bits of data and can map these bits of data to commands on our remote. This stage will vary greatly depending on your remote and is largely a matter of trial and error. There are, however, a few tips I can share that may make this easier. 

The easiest bits to find first are any that represent functionality that can be either on or off. Power is a great example of this and the following image shows our command data oscilating between these two states. Immediately in this image we notice that bits 3, 22, 66 (counting from 0) are all changing, suggesting that these all control power.

{% include image.html name="ac-ir-power-oscillation.mp4" %}

Slightly more difficult is any feature that has multiple states. We can see in this image as we change the temperature, which has a range of 16–30, bits 8–11 also change. Those who have experience with binary arithmetic may notice that this is actually a 4 bit integer which allows us to infer some extra information about the order of these bits.

{% include image.html name="ac-ir-temperature-increment.mp4" %}

When bits are being streamed serially (one at a time) it is important to know in which order these bits are being sent. We can see that as this integer is being incremented, the left most digit carries over to the right. This tells us that the least significant bit is being sent first. This is also likely to be the case for the entire stream and will be important if you ever wish to be able to reconstruct the command successfully. Through trial and error, by changing settings on the remote one by one, we can slowly map different functionality to different bits in our command data.

Now if you're paying attention you may have noticed that bits 63–66 are also changing with the temperature. But how can bit 66 be used to control power and temperature? This brings us to the final piece of the puzzle which is a checksum. Essentially these bits don't contain any new data but rather data that validates other bits and that none of these bits have been interfered with during transmission. The algorithm used to calculate this will vary between protocols and is something that will take more trial and error and little bit of intuition. The goal put simply though, is to work backwards until the checksum is zero at which point we've successfully reversed the algorithm.

In my case, when looking at the command data I noticed that as the temperature was incrementing so was the checksum. I also noticed that the checksum only changed with bits 0–3 and 8–11. So initially I thought the checksum may just be these two half bytes summed together. So I treated these as 4 bit integers and subtracted them both from the checksum. This didn't get me to zero, but, this did calculate a number that no longer changed with the command data. This meant all we had to do was offset this by another arbitrary number which in my case was 6. At this point I could calculate the matching checksum by adding both 4 bit integers and subtracting 6.

Once this process has been exhausted you should have a complete map of the command data. Here's mine, for example.

```
DeLonghi AC map

  (header mark and space)
  byte 0 = Basic Modes
    b2-0 = Modes
      000 (0) = Auto (temp = 25C)
      001 (1) = Cool
      010 (2) = Dry (temp = 25C, but not shown)
      011 (3) = Fan
      100 (4) = Heat
    b3 = Power Status (1 = On, 0 = Off)[duplicated at byte 2 b6]
    b5-4 = Fan (Basic modes)
      00 (0) = Auto
      01 (1) = Fan 1
      10 (2) = Fan 2
      11 (3) = Fan 3 or higher (See byte 14)
    b6 = Vent swing (1 = On, 0 = Off) (See byte 4)
    b7 = Sleep Modes 1 & 3 (1 = On, 0 = Off)
  byte 1 = Temperature
    b3-0 = Degrees C.
      0000 (0) = 16C
      0001 (1) = 17C
      0010 (2) = 18C
      ...
      1101 (13) = 29C
      1110 (14) = 30C
  byte 2 = Extras
    b3-0 = UNKNOWN, typically 0
    b4 = Turbo Fan (1 = On, 0 = Off)
    b5 = Light (Display) (1 = On, 0 = Off)
    b6 = Power Status (1 = On, 0 = Off)[duplicated at byte 0 b3]
    b7 = UNKNOWN, typically 0
  byte 3 = UNKNOWN, typically 0b01010000
  byte 4
    b2-0 = UNKNOWN, typically 0b010
    (intermission mark and space)
    b6-3 = Swing Vent Vertical
      0000 (0) = No swing
      0001 (1) = Full Swing
      0010 (2) = No swing - Top
      0011 (3) = No swing - Top Middle
      0100 (4) = No swing - Middle
      0101 (5) = No swing - Middle Bottom
      0110 (6) = No swing - Bottom
      0111 (7) = Swing - Bottom
      1001 (9) = Swing - Middle
      1011 (11) = Swing - Top
    b7 = UNKNOWN, typically 0
  byte 5
    b2-0 = UNKNOWN, typically 0
    b4-3 = Temp display
      00 (0) = Off
      01 (1) = Setting Temp
      10 (2) = Indoor Ambient Temp
      11 (3) = Outdoor Ambient Temp
    b5 = I Feel(requires follow-up payload which is repeated every 10 minutes)
  byte 6 = UNKNOWN, typically 0
  byte 7
    b6-0 = UNKNOWN, typically 0
    b7 = checksum (first bit of 4)
  byte 8
    b2-0 = checksum (last 3 bits of 4)
  (footer mark and space)

  Checksum is the sum of the first 4 bits of byte 0 and byte 1 minus 6.
  Overflow can be ignored.
```

With this, the earlier timing information we gathered and bit order, we now have enough information to reimplement this protocol and send arbitrary commands to your device. For now, reimplementation will be left as an exercise to the reader but stay tuned and in the meantime the source for [IRRemote][3] is a great place to see how this is done already.


[1]:https://en.wikipedia.org/wiki/Modulation
[2]:https://en.wikipedia.org/wiki/Modem
[3]:https://github.com/z3t0/Arduino-IRremote
[4]:https://github.com/markszabo/IRremoteESP8266
[5]:(https://github.com/markszabo/IRremoteESP8266/blob/master/tools/auto_analyse_raw_data.py)
[6]:http://www.pcbheaven.com/wikipages/Pulse_Position_Modulation/
