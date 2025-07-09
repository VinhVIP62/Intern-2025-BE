import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@modules/user/entities/user.schema';
import { Sport } from '@modules/sport/entities/sport.schema';
import bcrypt from 'bcrypt';

const randomNames = [
	'Minh Quân',
	'Bảo Ngọc',
	'Gia Huy',
	'Khánh Linh',
	'Hải Đăng',
	'Phương Thảo',
	'Hoàng Nam',
	'Diễm My',
	'Thanh Tùng',
	'Ngọc Hân',
	'Thế Anh',
	'Mai Anh',
	'Đức Huy',
	'Thu Hà',
	'Anh Dũng',
	'Trúc Lam',
	'Công Minh',
	'Tú Anh',
	'Quang Vinh',
	'Lan Chi',
	'Hồng Sơn',
	'Tường Vy',
	'Nhật Hào',
	'Minh Châu',
	'Thiên Bảo',
	'Bích Phương',
	'Anh Thư',
	'Đăng Khoa',
	'Mỹ Linh',
	'Tuấn Kiệt',
	'Kim Ngân',
	'Trí Dũng',
	'Hà My',
	'Nam Phong',
	'Linh Đan',
	'Thanh Bình',
	'Ngọc Trâm',
	'Thành Đạt',
	'Yến Nhi',
	'Văn Khánh',
];

const levels = ['beginner', 'intermediate', 'advanced'];

function getRandomElements<T>(arr: T[], count: number): T[] {
	const shuffled = arr.slice().sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const userModel = app.get<Model<User>>(getModelToken(User.name));
	const sportModel = app.get<Model<Sport>>(getModelToken(Sport.name));

	// Clear old data (optional for development)
	await userModel.deleteMany({});
	await sportModel.deleteMany({});

	// Seed sports
	const sports = await sportModel.insertMany([
		{
			name: 'Pickleball',
			description:
				'Môn thể thao kết hợp giữa tennis, bóng bàn và cầu lông, chơi trên sân nhỏ với vợt và bóng nhựa có lỗ.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/11685/11685481.png',
		},
		{
			name: 'Cầu lông',
			description:
				'Môn thể thao tốc độ cao chơi với vợt và trái cầu lông, thường thi đấu đơn hoặc đôi trên sân chia đôi bởi lưới.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/733/733655.png',
		},
		{
			name: 'Bóng đá',
			description:
				'Môn thể thao đồng đội phổ biến nhất thế giới, hai đội cố gắng đưa bóng vào khung thành đối phương.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972179.png',
		},
		{
			name: 'Tennis',
			description:
				'Môn thể thao đối kháng sử dụng vợt để đánh bóng qua lưới, chơi đơn hoặc đôi trên sân cứng, đất nện hoặc cỏ.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/726/726581.png',
		},
		{
			name: 'Bóng chuyền',
			description:
				'Môn thể thao đồng đội thi đấu trên sân có lưới, mục tiêu là đưa bóng chạm sàn bên phần sân đối phương.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/861/861512.png',
		},
		{
			name: 'Bóng rổ',
			description:
				'Môn thể thao đồng đội, nơi người chơi cố gắng ghi điểm bằng cách ném bóng vào rổ cao của đội đối phương.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png',
		},
		{
			name: 'Phức hợp',
			description:
				'Kết hợp nhiều môn thể thao khác nhau trong một hoạt động, thường bao gồm các bài tập đa dạng và toàn thân.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/2846/2846920.png', // generic training icon
		},
		{
			name: 'Golf',
			description:
				'Môn thể thao đánh bóng vào lỗ trên sân cỏ rộng lớn với số cú đánh ít nhất, đòi hỏi kỹ năng và sự kiên nhẫn.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/8089/8089983.png',
		},
		{
			name: 'Padel',
			description:
				'Môn thể thao kết hợp giữa tennis và squash, chơi đôi trên sân có tường bao quanh, dùng vợt đặc biệt không có dây.',
			iconUrl: 'https://cdn-icons-png.flaticon.com/512/10664/10664834.png',
		},
	]);

	console.log(
		'Seeded Sports:',
		sports.map(s => s.name),
	);

	const hashedPassword = await bcrypt.hash('Password@123', 10);

	// Seed users
	const users = [
		{
			email: 'admin@gmail.com',
			password: hashedPassword,
			fullName: 'Admin',
			avatarUrl: 'https://i.pravatar.cc/150?img=70',
			location: {
				type: 'Point',
				coordinates: [106.700981, 10.776889], // HCM
				address: '1 Nguyen Hue, District 1',
				city: 'Ho Chi Minh',
				district: 'District 1',
			},
			sports: [
				{ sport: sports[0]._id, level: 'advanced' },
				{ sport: sports[1]._id, level: 'intermediate' },
			],
			oauthProvider: null,
			roles: ['admin'],
		},
	];
	for (let i = 1; i <= 10; i++) {
		const name = randomNames[getRandomInt(0, randomNames.length - 1)];
		const randomSports = getRandomElements(sports, getRandomInt(1, 2)).map(s => ({
			sport: s._id,
			level: levels[getRandomInt(0, levels.length - 1)],
		}));

		users.push({
			email: `user${i}@gmail.com`,
			password: hashedPassword,
			fullName: name,
			roles: ['user'],
			avatarUrl: `https://i.pravatar.cc/150?img=${getRandomInt(1, 70)}`,
			oauthProvider: null,
			sports: randomSports,
			location: {
				type: 'Point',
				coordinates: [106.700981 + Math.random() * 0.01, 10.776889 + Math.random() * 0.01],
				address: `Số ${getRandomInt(1, 100)} Nguyễn Văn Cừ`,
				city: 'Ho Chi Minh',
				district: 'District 1',
			},
		});
	}

	const createdUsers = await userModel.insertMany(users);
	console.log(
		'Seeded Users:',
		createdUsers.map(u => `${u.fullName} (${u.email})`),
	);

	await app.close();
	process.exit(0);
}

bootstrap().catch(err => {
	console.error(err);
	process.exit(1);
});
