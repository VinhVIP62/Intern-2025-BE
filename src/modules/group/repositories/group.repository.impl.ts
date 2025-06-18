import { Injectable } from '@nestjs/common';
import { IGroupRepository } from './group.repository';

@Injectable()
export class GroupRepositoryImpl implements IGroupRepository {}
