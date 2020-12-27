# @amotarao/twitter

Twitter API Client on Node.js.  
Supporting for Twitter API [v1.1](https://developer.twitter.com/en/docs/twitter-api/v1) and [v2](https://developer.twitter.com/en/docs/twitter-api/early-access)


```ts
import Twitter from '@amotarao/twitter';

const client = new Twitter({
  api_version: '2',
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: '',
});


const params = {
  usernames: 'Twitter,TwitterJP',
  'user.fields': 'profile_image_url',
};
client.get('/users/by', params)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
```

## Installation

```bash
npm install @amotarao/twitter
```
