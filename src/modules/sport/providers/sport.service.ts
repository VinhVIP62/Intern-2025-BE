import { Injectable } from '@nestjs/common';
import { ISportRepository } from '../repositories/sport.repository';
import { plainToInstance } from 'class-transformer';
import { SportResponseDto } from '../dto/sports-response.dto';

@Injectable()
export class SportService {
	constructor(private readonly sportRepository: ISportRepository) {}

	async getAllSports(): Promise<SportResponseDto[]> {
		const sports = await this.sportRepository.findAll();
		return plainToInstance(SportResponseDto, sports, {
			excludeExtraneousValues: true,
		});
	}
}
