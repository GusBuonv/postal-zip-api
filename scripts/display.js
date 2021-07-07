// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('../dist/src/App/client.js');

const portIndex = process.argv.findIndex((a) => a === '-p') + 1;
if (portIndex === 0) {
  console.error('ERROR: Missing required command line option "-p $PORT"');
  process.exit();
} else if (portIndex === process.argv.length) {
  console.error('ERROR: Missing value for required command line option "-p $PORT"');
  process.exit();
}

const port = process.argv[portIndex];
if (/[^0-9]/.test(port)) {
  console.error('ERROR: Invalid $PORT provided. The port must consist only of numbers.');
  process.exit();
}

const client = new Client({ hostname: `http://localhost:${port}` });
client.display()
  .then((result) => {
    console.log(result);
  })
  .catch((e) => {
    console.error(e.toString());
    process.exit();
  });
