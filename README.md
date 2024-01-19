# Steps to run (Docker)

```docker build -t fetch-take-home .```

```docker run --name=vineet_kalghatgi_submission -p 3000:3000 fetch-take-home```

The application should start listening on port 3000 once the above steps are performed

# Steps to run (npm)
```npm install```

```sudo touch /opt/db.json```

```sudo chmod 777 /opt/db.json```

```npm start```

The application should start listening on port 3000 once the above steps are performed

# Code
- The source code can be found in the `src` directory
- `index.ts`` is the entry point
- the models directory contains interfaces for Receipt and ReceiptItem
- the routes directory contains one file: `receipts.ts` that handles all routes starting with `/receipt`
- The json data is written into a json file in located at `/opt/db.json`

# My Website
- https://vineet192.github.io