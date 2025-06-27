// src/configs/mongoose.config.ts
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { IEnvVars } from '@configs/config';

export default (configService: ConfigService<IEnvVars>): MongooseModuleOptions => {
	const dbConfig = configService.get('database', { infer: true })!;

	console.log('🔧 Database Configuration Loading...');

	return {
		uri: dbConfig.uri,
		// Connection pooling configuration
		connectionFactory: connection => {
			console.log('🔌 Setting up MongoDB connection...');

			// Set connection pool size
			connection.set('maxPoolSize', dbConfig.maxPoolSize || 10);
			connection.set('minPoolSize', dbConfig.minPoolSize || 2);
			connection.set('maxIdleTimeMS', dbConfig.maxIdleTimeMS || 30000);
			connection.set('waitQueueTimeoutMS', dbConfig.waitQueueTimeoutMS || 2500);
			connection.set('maxConnecting', dbConfig.maxConnecting || 2);

			// Timeout configurations
			connection.set('serverSelectionTimeoutMS', dbConfig.serverSelectionTimeoutMS || 5000);
			connection.set('socketTimeoutMS', dbConfig.socketTimeoutMS || 45000);
			connection.set('connectTimeoutMS', dbConfig.connectTimeoutMS || 10000);
			connection.set('heartbeatFrequencyMS', dbConfig.heartbeatFrequencyMS || 10000);

			// Buffer configurations
			connection.set('bufferMaxEntries', 0); // Disable mongoose buffering
			connection.set('bufferCommands', false); // Disable mongoose command buffering

			// Retry configurations
			connection.set('retryWrites', true); // Enable retryable writes
			connection.set('retryReads', true); // Enable retryable reads

			// Compression
			connection.set('compressors', ['zlib']); // Enable compression
			connection.set('zlibCompressionLevel', 6); // Compression level

			// Connection event listeners
			connection.on('connected', () => {
				console.log('✅ MongoDB connected successfully');
				console.log('📈 Connection Pool Settings Applied:');
				console.log(`   - Max Pool Size: ${connection.config?.maxPoolSize || 'default'}`);
				console.log(`   - Min Pool Size: ${connection.config?.minPoolSize || 'default'}`);
				console.log(`   - Socket Timeout: ${connection.config?.socketTimeoutMS || 'default'}ms`);
			});

			connection.on('error', err => {
				console.error('❌ MongoDB connection error:', err);
			});

			connection.on('disconnected', () => {
				console.log('⚠️ MongoDB disconnected');
			});

			connection.on('reconnected', () => {
				console.log('🔄 MongoDB reconnected');
			});

			// Thêm event listeners khác để debug
			connection.on('connecting', () => {
				console.log('🔄 MongoDB connecting...');
			});

			connection.on('disconnecting', () => {
				console.log('🔄 MongoDB disconnecting...');
			});

			// Kiểm tra nếu đã connected
			if (connection.readyState === 1) {
				console.log('✅ Connection already established!');
			}

			console.log('⚙️ Connection factory setup completed');
			return connection;
		},
		// Write concern for better durability
		writeConcern: {
			w: 'majority',
			j: true,
			wtimeout: 10000,
		},
		// Read preference
		readPreference: 'primaryPreferred',
		// TLS/SSL settings (if needed)
		// ssl: true,
		// sslValidate: true,
		// sslCA: fs.readFileSync('/path/to/ca.pem'),
		// sslCert: fs.readFileSync('/path/to/cert.pem'),
		// sslKey: fs.readFileSync('/path/to/key.pem'),
		// sslPass: 'your-ssl-passphrase',
	};
};
