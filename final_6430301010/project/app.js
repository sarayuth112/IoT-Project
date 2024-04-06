const Env = require('./models/env');
const Status = require('./models/devicestatus');
const Don = require('./models/fertilizer');
const Water = require('./models/watertimer');
const Config = require('./models/configs');///////////////////////////
const express = require('express');
var qs = require('querystring');
const mongoose = require('mongoose');
const hbs = require('hbs');
var path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const Image = require('./models/image');



var app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('uploads'));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views')
const static_path = path.join(__dirname, "/public")
app.use(express.static(static_path));
console.log(static_path);
const WebSocket = require('ws');
const { env } = require('process');
hbs.registerHelper('iff', function (a, operator, b, opts) {
  var bool = false;
  switch (operator) {
    case '==':
      bool = a == b;
      break;
    case '>':
      bool = a > b;
      break;
    case '<':
      bool = a < b;
      break;
    case '!=':
      bool = a != b;
      break;
    default:
      throw "Unknown operator " + operator;
  }

  if (bool) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper('ifCond', function (v1, options) {
  if (v1 % 3 == 2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('iftime', function (v1, v2, options) {
  if (v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('forlist', function (v1, v2, options) {
  var i;
  var cmd = "<option selected value=" + v2 + ">" + (v2) + "</option>";
  for (i = 0; i < v1.length; i++) {
    if (v1[i] != v2) {
      cmd += "<option value=" + v1[i] + ">" + (v1[i]) + "</option>"

    }

  }
  return cmd;
});

const port = 3000;
var hum = "30";


app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});



var appPort = 3001;
// Normal HTTP configuration
//let http = require('http').Server(app;

//const wss = new WebSocket.Server({ server:http });
const wss = new WebSocket.Server({ port: appPort });
wss.on('connection', async function connection(wssLocal) {
  console.log('A new client Connected!111111111111111111 11111111111111111111111111');
  // ws.send('node0_status_pir_x');


  wss.on('message', function incoming(message) {
    console.log('received: %s', message);

    wss.clients.forEach(function each(client) {
      if (client !== wss && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

  });
  const query = {};
  const sort = { time: -1 };
  const limit = 1;
  const envs = await Env.find({}).sort(sort).limit(1);
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
  console.log(envs);
  console.log("BBBBBBBBBBBBBBBBBBBB")
  var test = [{ "temperature": envs[0].temperature, "humidity": envs[0].humidity, "EC": envs[0].EC, "PH": envs[0].PH,"n": envs[0].n,"p": envs[0].p,"k": envs[0].k }];

  var statusAllJson = JSON.stringify(test);

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {

      console.log(statusAllJson);
      client.send(statusAllJson);

    }
  });


});



mongoose.connect('mongodb://localhost:27017/iot', {
  useNewUrlParser: true
});

app.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
app.get('/temp', (req, res) => {
  var temp = 10;
  var temperature = "temp=" + temp
  res.send(temperature);
});
app.get('/tracking', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = await Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("tracking", { log: log })

});

app.get('/aboutus', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = await Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("aboutus", { log: log })

});

app.get('/setting', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = await Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("setting", { log: log })

});

app.get('/image', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = await Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("image", { log: log })

});


app.get('/getenvs', async (req, res) => {
  const envs = await Env.findOne({});
  res.json(envs);
});

app.get('/getstatus', async (req, res) => {
  const sort = { time: -1 };
  const limit = 1;
  // const envs = await Env.find({}).sort(sort).limit(1);
  const status = await Status.find().sort(sort).limit(1);
  res.json(status);
});

app.post('/sethum', (req, res) => {
  var data = ''
  req.on('data', chunk => {
    console.log('A chunk of data has arrived: ', chunk);
    data = data + chunk;
    console.log(data);
    hum = data;
  });
  req.on('end', () => {
    console.log('No more data');
  })
  res.sendStatus(200);
});

var mqtt = require('mqtt');

const MQTT_SERVER = "m15.cloudmqtt.com";
const MQTT_PORT = "12987";
//if your server don't have username and password let blank.
const MQTT_USER = "cyejnmdr";
const MQTT_PASSWORD = "Is7roaqnQX09";

// Connect MQTT
var client = mqtt.connect({
  host: MQTT_SERVER,
  port: MQTT_PORT,
  username: MQTT_USER,
  password: MQTT_PASSWORD
});

client.on('connect', function () {
  // Subscribe any topic
  console.log("MQTT Connect");
  client.subscribe('envs', function (err) {
    if (err) {
      console.log(err);
    }
  });
});

// Receive Message and print on terminal
client.on('message', async function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  var temp = ['1', '2', '3', '4'];
  var temps = message.toString().split(",");
  axios.post('http://10.64.69.33:3000/envs', {
    humidity: temps[0],
    temperature: temps[1],
    EC: temps[2],
    PH: temps[3],
    n:  temps[4],
    p:  temps[5],
    k:  temps[6]
  })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  console.log(message.toString());
});

setInterval(() => {
  //client.publish("pump", "hello from NodeJS");
}, 5000);






app.use(express.json());
// mock data
const products = [{}];



app.post('/pump', async (req, res) => {
  const payload = req.body;
 
  var date_ob = new Date();
  const saveStatus= new Status({
    device: "pump",
    status: payload.status,
    time: date_ob,
  });
  //const product = new Env(payload);
  await saveStatus.save();

  //send MQTT broker;  publisher (nodejs)
  console.log("Pump_1: "+payload.status);

  client.publish("Pump_1", payload.status, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })

  res.status(201).json({ status: payload.status });
});

// app.get("/getwaterpump", async (req, res) => {
//   const envs = await Status.findOne({});
//   res.json(envs);
// });

app.post("/fertilizer", async (req, res) => {
  const payload = req.body;

  var date_ob = new Date();
  const saveStatus = new Status({
    device: "fertilizer",
    status: payload.status,
    time: date_ob,
  });
  //const product = new Env(payload);
  await saveStatus.save();

  //send MQTT broker;  publisher (nodejs)
  console.log("Pump_2: "+payload.status);

  client.publish("Pump_2", payload.status, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error);
    }
  });

  res.status(201).json({ status: payload.status });
});

app.post("/light", async (req, res) => {
  const payload = req.body;

  var date_ob = new Date();
  const saveStatus = new Status({
    device: "light",
    status: payload.status,
    time: date_ob,
  });
  //const product = new Env(payload);
  await saveStatus.save();

  //send MQTT broker;  publisher (nodejs)
  console.log("Light_1: "+payload.status);

  client.publish(
    "Light_1", payload.status,
    { qos: 0, retain: false },
    (error) => {
      if (error) {
        console.error(error);
      }
    }
  );
  
  res.status(201).json({ status: payload.status });
});


app.post('/envs', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  var date_ob = new Date();
  const saveEnvs = new Env({
    temperature: payload.temperature,
    humidity: payload.humidity,
    time: date_ob,
    EC: payload.EC,
    PH: payload.PH,
    n: payload.n,
    p: payload.p,
    k: payload.k,
    type: payload.type

  })
  //const product = new Env(payload);
  await saveEnvs.save();
  const query = {};
  const sort = { time: -1 };
  const limit = 1;
  const envs = await Env.find({}).sort(sort).limit(1);

  console.log(envs);
  var test = [{ "temperature": envs[0].temperature, "humidity": envs[0].humidity, "EC": envs[0].EC, "PH": envs[0].PH,"n": envs[0].n,"p": envs[0].p,"k": envs[0].k }];


  var statusAllJson = JSON.stringify(test);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {

      console.log(statusAllJson);
      client.send(statusAllJson);

    }
  });


  res.status(201).end();
});

app.post('/status', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  var date_ob = new Date();
  const saveEnvs = new Status({
    time: date_ob,
    type: payload.type,
    status: payload.status
  });

  await saveEnvs.save();

  res.status(201).end();
});



app.post('/water', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  var date_ob = new Date();
  const saveEnvs = new Water({
    time: date_ob,
    status: payload.status,
    time: payload.time,
    type: payload.type

  })
  //const product = new Env(payload);
  await saveEnvs.save();

  res.status(201).end();
});

////////////////////////////////////////////////////////////////////////////

app.post('/configs', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  var date_ob = new Date();
  const saveEnvs = new Config({
    time: date_ob,
    watertimer: payload.watertimer,
    quantity: payload.quantity,
    herbicide: payload.herbicide,
    time: payload.time,
    type: payload.type

  })
  //const product = new Env(payload);
  await saveEnvs.save();

  res.status(201).end();
});

app.post('/quantity', async (req, res) => {
  const payload = req.body;
  
  var date_ob = new Date();
  const saveEnvs = new Confir({
    time: date_ob,
    quantity: payload.quantity,
    time: payload.time,
    type: payload.type
  })
  //const product = new Env(payload);
  await saveEnvs.save();


  


  res.status(201).end();
});

app.post("/ajax_updateWaterTimer", async (req, res) => {
  //console.log(req);
  console.log("EEEEEEEEEEEEEEEEEEEEEE =" + req.body.id);
  console.log("EEEEEEEEEEEEEEEEEEEEEE =" + req.body.waterTimer);
  try {

    const payload = req.body;
    console.log(payload);

    var date_ob = new Date();
    const saveConfig = new Don({
      waterTimer: payload.waterTimer,
      status: payload.status,
      time: date_ob,

    })
    await saveConfig.save();

    console.log("aaaaaaaaaaaaaaaaaaaaaaaa");

    return res.status(200).json({ status: true })
  } catch (error) {
    res.send("Set Status error");
  }
});

app.post('/toggle-water-timer', (req, res) => {
  // ตรวจสอบสถานะของปุ่ม On/Off ที่ถูกส่งมาจากหน้าเว็บ
  const status = req.body.status;

  // ทำการบันทึกสถานะปุ่ม On/Off ล่าสุดไว้ที่นี่
  // โดยใช้เทคนิคต่างๆ เช่นการใช้งาน MongoDB, การบันทึกไปยังไฟล์, หรือใช้แรงงานในการจัดเก็บข้อมูล

  // ส่งข้อมูลกลับไปยังหน้าเว็บ เช่น res.send({ success: true });
});

app.post('/toggle-autofill', (req, res) => {
  // ตรวจสอบสถานะของปุ่ม On/Off ที่ถูกส่งมาจากหน้าเว็บ
  const status = req.body.status;

  // ทำการบันทึกสถานะปุ่ม On/Off ล่าสุดไว้ที่นี่
  // โดยใช้เทคนิคต่างๆ เช่นการใช้งาน MongoDB, การบันทึกไปยังไฟล์, หรือใช้แรงงานในการจัดเก็บข้อมูล

  // ส่งข้อมูลกลับไปยังหน้าเว็บ เช่น res.send({ success: true });
});

app.post('/toggle-herbicide', (req, res) => {
  // ตรวจสอบสถานะของปุ่ม On/Off ที่ถูกส่งมาจากหน้าเว็บ
  const status = req.body.status;

  // ทำการบันทึกสถานะปุ่ม On/Off ล่าสุดไว้ที่นี่
  // โดยใช้เทคนิคต่างๆ เช่นการใช้งาน MongoDB, การบันทึกไปยังไฟล์, หรือใช้แรงงานในการจัดเก็บข้อมูล

  // ส่งข้อมูลกลับไปยังหน้าเว็บ เช่น res.send({ success: true });
  
});

app.post('/upload_image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Save image data to MongoDB
  const newImage = new Image({
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  });

  try {
    await newImage.save();
    res.status(201).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save image to database' });
  }
});



app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Route เพื่อให้เซิร์ฟ URL ของรูปภาพล่าสุด
app.get('/latest_image_url', async (req, res) => {
  try {
    const latestImage = await Image.findOne().sort({ uploadedAt: -1 }); // ค้นหารูปภาพล่าสุด
    const latestImageUrl = latestImage ? latestImage.filename : ''; // รับชื่อไฟล์ของรูปภาพล่าสุด
    res.send(`/uploads/${latestImageUrl}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ไม่สามารถดึง URL รูปภาพล่าสุดได้' });
  }
});



// document.addEventListener("DOMContentLoaded", function() {
//   // เรียก API endpoint เพื่อดึง URL ของรูปภาพล่าสุด
//   fetch("/latest_image_url")
//     .then(response => response.json())
//     .then(url => {
//       // สร้าง element <img> และกำหนด URL ของรูปภาพล่าสุดให้เป็น src attribute
//       var imgElement = document.createElement("img");
//       imgElement.src = url;
//       // หาส่วนที่มี class="image-gallery"
//       var imageGallery = document.querySelector(".image-gallery");
//       // เพิ่ม element <img> ที่สร้างเข้าไปในส่วนที่มี class="image-gallery"
//       imageGallery.appendChild(imgElement);
//     })
//     .catch(error => console.error(error));
// });


/////////////////////
app.post('/upload_image_and_text', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Save image data and text data to MongoDB
  const newImage = new Image({
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    textData: req.body.additionalData // Assuming the text data is sent in the request body
  });

  try {
    await newImage.save();
    res.status(201).json({ message: 'Image and text uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save image and text to database' });
  }
});

