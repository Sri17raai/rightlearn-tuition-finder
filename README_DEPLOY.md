# RightLearn Deployment

The `file:///C:/.../index.html` link only works on your computer. To share the website with anyone, deploy it to a hosting platform so it gets an internet URL.

## Best Simple Deployment

Use a backend host such as Render, Railway, or another Node.js hosting service.

Recommended settings:

- Runtime: Node.js
- Build command: leave blank or use `npm install`
- Start command: `npm start`
- Port: use the platform default. The app already reads `process.env.PORT`.

After deployment, the platform will give you a public URL like:

`https://your-project-name.onrender.com`

Share that URL with friends.

## Important About Permanent Data

This project currently saves data to JSON files inside the `data` folder:

- `data/classes.json`
- `data/callbacks.json`

That works on your laptop. On many free hosting platforms, file storage may reset after redeploys or restarts. For a real public platform, connect a database such as Supabase, Firebase, MongoDB Atlas, or PostgreSQL.

## Local Run

On your laptop, run:

```powershell
npm start
```

Then open:

`http://localhost:8080/`
