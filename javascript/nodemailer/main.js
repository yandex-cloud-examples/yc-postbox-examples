import { ses } from './sdk.js';
import { smtp } from './smtp.js';

const example = process.argv[2];

async function main() {
    switch (example) {
        case 'sdk':
            await ses();
            break;
        case 'smtp':
            await smtp();
            break;
        default:
            console.log('Please specify an example to run: "sdk" or "smtp"');
            console.log('Usage: node main.js <sdk|smtp>');
    }
}

main().catch(console.error);

