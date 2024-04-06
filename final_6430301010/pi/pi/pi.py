import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt

# กำหนดค่า GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO_LIGHT = 17
GPIO_PUMP1 = 4
GPIO_PUMP2 = 27 
GPIO.setup(GPIO_LIGHT, GPIO.OUT)
GPIO.setup(GPIO_PUMP1, GPIO.OUT)
GPIO.setup(GPIO_PUMP2, GPIO.OUT)

# กำหนดค่า MQTT Broker

broker = 'm15.cloudmqtt.com'
port = 12987
light_topic = "Light_1"
pump_topic = "Pump_1"
pump_topic2="Pump_2"
username = 'cyejnmdr'
password = 'Is7roaqnQX09'

# เชื่อมต่อกับ MQTT Broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print("Failed to connect, return code %d\n", rc)
    client.subscribe([(light_topic, 0), (pump_topic, 0),(pump_topic2, 0)])

# เมื่อมีข้อมูลเข้ามาจาก MQTT Broker
def on_message(client, userdata, msg):
    print("Received message: " + msg.payload.decode())
    if msg.topic == light_topic:
        if msg.payload.decode() == "on":
            GPIO.output(GPIO_LIGHT, GPIO.HIGH)  # เปิด
            print("Turning on Light 1")
        elif msg.payload.decode() == "off":
            GPIO.output(GPIO_LIGHT, GPIO.LOW)  # ปิด
            print("Turning off Light 1")

    elif msg.topic == pump_topic:
        if msg.payload.decode() == "on":
            GPIO.output(GPIO_PUMP1, GPIO.LOW)  # เปิด
            print("Turning on Pump 1")
        elif msg.payload.decode() == "off":
            GPIO.output(GPIO_PUMP1, GPIO.HIGH)  # ปิด
            print("Turning off Pump 1")

    elif msg.topic == pump_topic2:  # ปั๊มที่สอง
        if msg.payload.decode() == "on":
            GPIO.output(GPIO_PUMP2, GPIO.LOW)  # เปิด
            print("Turning on Pump 2")
        elif msg.payload.decode() == "off":
            GPIO.output(GPIO_PUMP2, GPIO.HIGH)  # ปิด
            print("Turning off Pump 2")


# กำหนดค่า MQTT Client
client = mqtt.Client()
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

# เชื่อมต่อกับ MQTT Broker
client.connect(broker, port, 60)

# เริ่มการรอรับข้อมูลจาก MQTT Broker
client.loop_forever()