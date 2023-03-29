
const axios = require('axios');
const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.use(cookieParser());

app.get('/login', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
  res.redirect(url);
});

app.get('/redirect', async (req, res) => {
  const code = req.query.code;

  try {
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          accept: 'application/json',
        },
      }
    );
    const accessToken = data.access_token;
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.get('/profile', async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.redirect('/login');
  }

  try {
    const { data } = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.get('/followers', async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.redirect('/login');
  }

  try {
    const { data } = await axios.get(
      'https://api.github.com/user/followers',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.get('/repos', async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.redirect('/login');
  }

  try {
    const { data } = await axios.get(
      'https://api.github.com/user/repos',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
