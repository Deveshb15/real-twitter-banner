require('dotenv').config()
const client = require('twitter-api-client');
const axios = require('axios');
const fs = require('fs');
const jimp = require('jimp');

const TWITTER_HANDLE = 'Deveshb15'
const twitterClient = new client.TwitterClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  accessToken: process.env.CONSUMER_KEY,
  accessTokenSecret: process.env.CONSUMER_SECRET
});

// async function test() {
//   const data = await twitterClient.accountsAndUsers.followersList({ screen_name: 'Deveshb15', count: 3 });

//   console.log(data.users)
// }

// test()

let image_url = [];

let lastDrawImage = 0;

let drawTimer;

const download_image = (url, image_path) =>
axios({
  url,
  responseType: 'stream',
}).then(
  response =>
    new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(image_path))
        .on('finish', () => resolve())
        .on('error', e => reject(e));
    }),
);

async function pollIt() {
  const params = {
    screen_name: TWITTER_HANDLE, 
    count: 3
  }
  const data = await twitterClient.accountsAndUsers.followersList(params);

  data.users.forEach(item => {
    image_url.unshift(item.profile_image_url_https)
  });
  
  (async () => {
    await download_image(image_url[0], './assets/img1.png')
    await download_image(image_url[1], './assets/img2.png')
    await download_image(image_url[2], './assets/img3.png')

  async function drawit() {
    lastDrawImage = Date.now();
    await drawImage('base.png' ,'./assets/img1.png', './assets/img2.png', './assets/img3.png');
  }
  const remaining = Date.now() - lastDrawImage;

  // Avoid hitting rate limit when update banner
  // 30 requests per 15 mins meaning 1 request per 30 secs
  if (remaining > 30000) {
    await drawit();
  } else {
    console.log('set timer', 30000 - remaining);
    clearTimeout(drawTimer);
    drawTimer = setTimeout(drawit, 30000 - remaining);
  }

  })();

}

async function drawImage(back, img1, img2, img3){
  let imgArr = [back, img1, img2, img3];

  let jimps = [];

  imgArr.forEach(image => jimps.push(jimp.read(image)));

  Promise.all(jimps).then(data => {
    return Promise.all(jimps)
  }).then(data => {
    data[0].composite(data[1],1070,30);
    data[0].composite(data[2],1160,30);
    data[0].composite(data[3],1250,30);

    data[0].write('test.png', function(){
      console.log("done");
    })
  })

  const base64 = await fs.readFileSync('test.png', { encoding: 'base64' });
  // console.log(base64);

  await twitterClient.accountsAndUsers.accountUpdateProfileBanner({banner: base64})
}

pollIt();
setInterval(() => {
  pollIt();
}, 6000);