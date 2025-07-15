import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	Request,
	UseGuards,
	Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GroupService } from '../providers/group.service';
import { ResponseEntity } from '@common/types';
import {
	CreateGroupDto,
	UpdateGroupDto,
	GroupResponseDto,
	PaginatedGroupsResponseDto,
	PaginatedSimpleGroupsResponseDto,
} from '../dto/group.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SportType } from '@modules/user/enums/user.enum';
import { Public } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { Roles } from '@common/decorators';
import { Role } from '@common/enum';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
	constructor(private readonly groupService: GroupService) {}

	@Version('1')
	@Post()
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tạo nhóm mới' })
	@ApiBody({ type: CreateGroupDto })
	@ApiResponse({
		status: 201,
		description: 'Tạo nhóm thành công',
		type: GroupResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	async createGroup(
		@Request() req,
		@Body() createGroupDto: CreateGroupDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<GroupResponseDto>> {
		const group = await this.groupService.createGroup(createGroupDto, req.user.id, i18n);

		return {
			success: true,
			data: group,
			message: i18n.t('group.GROUP_CREATED_SUCCESS'),
		};
	}

	@Version('1')
	@Get()
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách tất cả nhóm' })
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng nhóm trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'sport',
		required: false,
		enum: Object.values(SportType),
		description: 'Lọc theo môn thể thao',
	})
	@ApiQuery({
		name: 'isPrivate',
		required: false,
		type: Boolean,
		description: 'Lọc theo loại nhóm (công khai/riêng tư)',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách nhóm thành công',
		type: PaginatedGroupsResponseDto,
	})
	async getAllGroups(
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('sport') sport?: string,
		@Query('isPrivate') isPrivate: boolean = false,
	): Promise<ResponseEntity<PaginatedGroupsResponseDto>> {
		const result = await this.groupService.getAllGroups(i18n, page, limit, sport, isPrivate);

		return {
			success: true,
			data: result,
			message: i18n.t('group.ALL_GROUPS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get('user/:userId')
	@ApiOperation({ summary: 'Lấy danh sách nhóm của người dùng' })
	@ApiParam({
		name: 'userId',
		description: 'ID của người dùng',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Số trang (mặc định: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Số lượng nhóm trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách nhóm của người dùng thành công',
		type: PaginatedSimpleGroupsResponseDto,
	})
	async getGroupsByUserId(
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<PaginatedSimpleGroupsResponseDto>> {
		const result = await this.groupService.getSimpleGroupsByUserId(userId, i18n, page, limit);

		return {
			success: true,
			data: result,
			message: i18n.t('group.USER_GROUPS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Get(':groupId')
	@Public()
	@ApiOperation({ summary: 'Lấy thông tin chi tiết nhóm theo ID' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy thông tin nhóm thành công',
		type: GroupResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async getGroupById(
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<GroupResponseDto>> {
		const group = await this.groupService.getGroupById(groupId, i18n);

		return {
			success: true,
			data: group,
			message: i18n.t('group.GROUP_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':groupId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Cập nhật thông tin nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({ type: UpdateGroupDto })
	@ApiResponse({
		status: 200,
		description: 'Cập nhật nhóm thành công',
		type: GroupResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền chỉnh sửa nhóm này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async updateGroup(
		@Request() req,
		@Param('groupId') groupId: string,
		@Body() updateGroupDto: UpdateGroupDto,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<GroupResponseDto>> {
		const group = await this.groupService.updateGroup(groupId, updateGroupDto, req.user.id, i18n);

		return {
			success: true,
			data: group,
			message: i18n.t('group.GROUP_UPDATED_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':groupId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Xóa nhóm thành công',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 403,
		description: 'Không có quyền xóa nhóm này',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async deleteGroup(
		@Request() req,
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.deleteGroup(groupId, req.user.id, i18n);

		return {
			success: true,
			message: i18n.t('group.GROUP_DELETED_SUCCESS'),
		};
	}
}
