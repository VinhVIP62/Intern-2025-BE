import { Injectable } from '@nestjs/common';
import { IEventRepository } from './event.repository';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {}
