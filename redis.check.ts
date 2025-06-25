import { createClient } from 'redis';

async function testRedis() {
	const client = createClient({
		socket: {
			host: 'localhost',
			port: 6379,
		},
	});

	client.on('error', err => console.error('Redis Client Error', err));
	await client.connect();

	await client.set('test-key', 'hello', { EX: 10 });
	const val = await client.get('test-key');
	console.log('[MANUAL REDIS]', val);

	await client.quit();
}

testRedis();
