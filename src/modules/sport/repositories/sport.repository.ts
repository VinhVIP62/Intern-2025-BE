import { Injectable } from '@nestjs/common';
import { Sport } from '../entities/sport.schema';

@Injectable()
export abstract class ISportRepository {
	abstract findAll(): Promise<Sport[]>;
}
