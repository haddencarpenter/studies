import Twitter from 'twitter-lite';

const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CLIENT_ID,
  consumer_secret: process.env.TWITTER_CLIENT_SECRET,
  access_token_key: process.env.TWITTER_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
})

export const tweet = (message) => {
  twitter.post('statuses/update', {
    status: message
  })
}

export default twitter