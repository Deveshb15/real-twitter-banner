// Require all the packages
require('dotenv').config()
const client = require('twitter-api-client');
const axios = require('axios');
const fs = require('fs');
const jimp = require('jimp');

// Your Twitter account
const TWITTER_HANDLE = 'Deveshb15'
const twitterClient = new client.TwitterClient({
  apiKey: process.env.API_KEY,                      //YOUR CONSUMER API KEY
  apiSecret: process.env.API_SECRET,                //YOUR CONSUMER API SECRET 
  accessToken: process.env.ACCESS_TOKEN,            //YOUR ACCESS TOKEN
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET    //YOUR ACCESS TOKEN SECRET
});

// Test the twitter-api-client
// async function test() {
//   const data = await twitterClient.accountsAndUsers.followersList({ screen_name: 'Deveshb15', count: 3 });

//   console.log(data.users)
// }

// test()

//push the url of profile image recent followers
let image_url = [];

//check below drawit()
let lastDrawImage = 0;

//function to download image
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

  // function to draw image and post it
  async function drawImage(back, img1, img2, img3){
    //Creating an array so it becomes easier to Promise.all instead of one at a time
    //Would love to see if you have any other approach to this, can't think of anything else
    let imgArr = [back, img1, img2, img3];
  
    let jimps = [];
  
    //Read the image in jimp and push it to jimps array 
    imgArr.forEach(image => jimps.push(jimp.read(image)));
  
    // fetch all the images
    Promise.all(jimps).then(data => {
      return Promise.all(jimps)
    }).then(data => {
      // composite the images on one another
      data[0].composite(data[1],1070,50); //Your banner is 1500x500px, so change this pixels accordingly
      data[0].composite(data[2],1160,50); //place the images wherever you want on the banner
      data[0].composite(data[3],1250,50); //experiment with it or DM me on Twitter @Deveshb15 if you want any help
  
      // Write the image and save it
      data[0].write('1500x500.png', function(){
        console.log("done");
      })
    })
  
    // encode to base64 to post the image
    const base64 = await fs.readFileSync('1500x500.png', { encoding: 'base64' });
    // console.log(base64);
  
    // Update the banner
    await twitterClient.accountsAndUsers.accountUpdateProfileBanner({banner: base64});
  }

async function start() {

  const name = Math.random();
  const params = {
    screen_name: TWITTER_HANDLE, //name of twitter account
    count: 3                     //number of followers to be fetched
  }
  // fetch followers
  const data = await twitterClient.accountsAndUsers.followersList(params);

  //push url of profile image to array
  data.users.forEach(item => {
    image_url.unshift(item.profile_image_url_https)
  });
  
  (async () => {
    //download the image
    await download_image(image_url[0], `${name}-1.png`)
    await download_image(image_url[1], `${name}-2.png`)
    await download_image(image_url[2], `${name}-3.png`)

  async function drawit() {
    lastDrawImage = Date.now();
    // Draw the image and Post it
    await drawImage('1500x500.png' ,`${name}-1.png`,`${name}-2.png`,`${name}-3.png`);
  }
  const remaining = Date.now() - lastDrawImage;
  
  // Avoid hitting rate limit when update banner
  // 30 requests per 15 mins meaning 1 request per 30 secs
  if (remaining > 30000) {
    await drawit();
  }

  async function deleteImages() {
    try{
      console.log('removing', `${name}{1,2,3}.png`);
      await fs.unlinkSync(`${name}-1.png`);
      await fs.unlinkSync(`${name}-2.png`);
      await fs.unlinkSync(`${name}-3.png`);
    }catch(e){
      console.log(e);
    }
  }

  await deleteImages();

})();
}

// start everything
start();
setInterval(() => {
  start(); 
}, 6000);
