try:
    import RPi.GPIO as GPIO
except RuntimeError:
    print('Error importing RPi.GPIO! Are you root?')
    exit(1)

import time
import socket

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
        
        connect_to_server()

    finally:
        GPIO.cleanup()

def connect_to_server():
    while True:
        try:
            s = socket.create_connection(('jbserver.no-ip.org', 15838))
            print('Connected to server.')

            while True:
                makeIt = s.recvfrom(1024)[0];

                print('makeIt = "' + makeIt + '".')

                setOutput(makeIt)
        except BaseException, e:
            print(e)

def setOutput(state):
    values = {
        'red': rgb(100, 0, 0),
        'green': rgb(0, 100, 0),
        'blue': rgb(0, 0, 100)
    }

    dcs = values.get(state.lower(), None)

    if dcs == None:
        print('That is not a supported color.')
    else:
        print('Setting color to ' + state)
        for color in pwm:
            pwm[color].ChangeDutyCycle(dcs[color])


def loop_cli():
    

    while True:
        cmd = raw_input('What color? ')

        if cmd == 'exit':
            return 
        
        setOutput(cmd)

def rgb(r, g, b):
    return { 'red': r, 'green': g, 'blue': b }

if __name__ == '__main__':
    main()
