try:
    import RPi.GPIO as GPIO
except RuntimeError:
    print('Error importing RPi.GPIO! Are you root?')
    exit(1)

import time

pins = {}
pwm = {}

def main():
    try:
        pins['red'] = 16
        pins['green'] = 20
        pins['blue'] = 21

        pwmFrequency = 1000 # hertz

        GPIO.setmode(GPIO.BCM) # Broadcom numbering


        # Set pins to output
        for color in pins:
            GPIO.setup(pins[color], GPIO.OUT)

        # Setup pulse width modulation
        for color in pins:
            pwm[color] = GPIO.PWM(pins[color], pwmFrequency)

        # Start each pin off
        for color in pwm:
            pwm[color].start(0)
        
        loop_cli()

    finally:
        GPIO.cleanup()

def loop_cli():
    values = {
        'red': rgb(100, 0, 0),
        'green': rgb(0, 100, 0),
        'blue': rgb(0, 0, 100)
    }

    while True:
        cmd = raw_input('What color? ')

        if cmd == 'exit':
            return
    
        dcs = values.get(cmd.lower(), None)

        if dcs == None:
            print('That is not a supported color.')
        else:
            print('Setting color to ' + cmd)
            for color in pwm:
                pwm[color].ChangeDutyCycle(dcs[color])

def rgb(r, g, b):
    return { 'red': r, 'green': g, 'blue': b }

if __name__ == '__main__':
    main()
