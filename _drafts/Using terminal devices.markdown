```bash
SERIAL_PORT=/dev/cu.wchusbserial1410; stty -f "$SERIAL_PORT" 115200|grep -a --line-buffered rawData "$SERIAL_PORT"|tr -u '\n' '\0'|xargs -0 -n1 python auto_analyse_raw_data.py
```

Seems complicated so lets go through this step by step.

`SERIAL_PORT=/dev/cu.wchusbserial1410;` simply sets a bash variable to the path of our serial device. This will need to be changed depending on your system and serial hardware. As it is used multiple times in our command storing it in a variable means you only need to change this once and reduces the risk of a typo introducing bugs.
`stty -f "$SERIAL_PORT" 115200` is used to configure the TTY device we will be connecting to. The `-f` option means the next argument will be a file pointing to the terminal device we wish to modify. Instead of listing the file correctly which can use our variable. By preceding the variable name with a `$` it indicates to our shell we want the value of this variable substituted. Finally, the number is the baud rate we wish to use which should match the baud rate configured in our firmware.
`grep -a --line-buffered rawData "$SERIAL_PORT"` will inspect all lines of input and only output those that match the supplied pattern. `-a` will force the input to be treated as text instead of binary data. `--line-buffered`
