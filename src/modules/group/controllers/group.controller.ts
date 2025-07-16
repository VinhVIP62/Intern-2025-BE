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
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiQuery,
	ApiBody,
	ApiConsumes,
} from '@nestjs/swagger';
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
import { PostService } from '@modules/post/providers/post.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from '@modules/post/dto/post.dto';

@ApiTags('Group')
@Controller('groups')
export class GroupController {
	constructor(
		private readonly groupService: GroupService,
		private readonly postService: PostService,
	) {}

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
	@ApiQuery({
		name: 'key',
		required: false,
		type: String,
		description: 'Tìm kiếm theo tên nhóm (có thể là 1 phần tên)',
		example: 'football',
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
		@Query('key') key?: string,
	): Promise<ResponseEntity<PaginatedSimpleGroupsResponseDto>> {
		const result = await this.groupService.getSimpleGroupsByUserId(userId, i18n, page, limit, key);

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

	// ====== GROUP MEMBERSHIP MANAGEMENT APIs ======

	@Version('1')
	@Post(':groupId/join')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Tham gia nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Tham gia nhóm thành công',
	})
	@ApiResponse({
		status: 400,
		description: 'Đã là thành viên hoặc dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async joinGroup(
		@Request() req,
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.joinGroup(groupId, req.user.id, i18n);

		return {
			success: true,
			message: i18n.t('group.JOIN_GROUP_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':groupId/leave')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Rời khỏi nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Rời khỏi nhóm thành công',
	})
	@ApiResponse({
		status: 400,
		description: 'Không phải thành viên hoặc dữ liệu không hợp lệ',
	})
	@ApiResponse({
		status: 401,
		description: 'Không có quyền truy cập',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async leaveGroup(
		@Request() req,
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.leaveGroup(groupId, req.user.id, i18n);
		return {
			success: true,
			message: i18n.t('group.LEAVE_GROUP_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':groupId/members/:userId/role')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Thay đổi vai trò thành viên (admin/member)' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiParam({
		name: 'userId',
		description: 'ID của người dùng',
		example: '507f1f77bcf86cd799439012',
	})
	@ApiBody({
		description: 'Thay đổi vai trò',
		schema: {
			type: 'object',
			properties: {
				role: {
					type: 'string',
					enum: ['admin', 'member'],
					description: 'Vai trò mới',
					example: 'admin',
				},
			},
			required: ['role'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Thay đổi vai trò thành công',
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
		description: 'Không có quyền thay đổi vai trò',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm hoặc người dùng',
	})
	async changeMemberRole(
		@Request() req,
		@Param('groupId') groupId: string,
		@Param('userId') userId: string,
		@Body('role') role: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.changeMemberRole(groupId, userId, role, req.user.id, i18n);

		return {
			success: true,
			message: i18n.t('group.ROLE_CHANGED_SUCCESS'),
		};
	}

	@Version('1')
	@Get(':groupId/members')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách thành viên nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
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
		description: 'Số lượng thành viên trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiQuery({
		name: 'role',
		required: false,
		enum: ['admin', 'member', 'waiting'],
		description: 'Lọc theo vai trò',
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách thành viên thành công',
		schema: {
			example: {
				success: true,
				data: {
					total: 15,
					page: 1,
					limit: 10,
					totalPages: 2,
					data: [
						{
							userId: '507f1f77bcf86cd799439012',
							fullName: 'Nguyen Van A',
							avatar: 'https://example.com/avatar1.jpg',
							role: 'admin',
							joinedAt: '2024-01-15T10:30:00.000Z',
						},
						{
							userId: '507f1f77bcf86cd799439013',
							fullName: 'Tran Thi B',
							avatar: 'https://example.com/avatar2.jpg',
							role: 'member',
							joinedAt: '2024-01-16T14:20:00.000Z',
						},
					],
				},
				message: 'Lấy danh sách thành viên thành công',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async getGroupMembers(
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
		@Query('role') role?: string,
	): Promise<ResponseEntity<any>> {
		const result = await this.groupService.getGroupMembers(groupId, i18n, page, limit, role);

		return {
			success: true,
			data: result,
			message: i18n.t('group.MEMBERS_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Post(':groupId/requests/:userId/approve')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Phê duyệt yêu cầu tham gia nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiParam({
		name: 'userId',
		description: 'ID của yêu cầu (user ID)',
		example: '507f1f77bcf86cd799439012',
	})
	@ApiBody({
		description: 'Phê duyệt yêu cầu',
		schema: {
			type: 'object',
			properties: {
				approved: {
					type: 'boolean',
					description: 'Phê duyệt hoặc từ chối, default = false',
					example: true,
				},
				reason: {
					type: 'string',
					description: 'Lý do từ chối (nếu approved = false)',
					example: 'Không phù hợp với nhóm',
				},
			},
			required: ['approved'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Xử lý yêu cầu thành công',
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
		description: 'Không có quyền phê duyệt yêu cầu',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm hoặc yêu cầu',
	})
	async approveJoinRequest(
		@Request() req,
		@Param('groupId') groupId: string,
		@Param('userId') userId: string,
		@Query('approved') approved: boolean,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.approveJoinRequest(groupId, userId, approved, req.user.id, i18n);

		return {
			success: true,
			message:
				approved ?
					i18n.t('group.REQUEST_APPROVED_SUCCESS')
				:	i18n.t('group.REQUEST_REJECTED_SUCCESS'),
		};
	}

	@Version('1')
	@Post(':groupId/invite')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Mời người dùng tham gia nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiBody({
		description: 'Danh sách người dùng được mời',
		schema: {
			type: 'object',
			properties: {
				userIds: {
					type: 'array',
					items: { type: 'string' },
					description: 'Danh sách ID người dùng được mời',
					example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
				},
			},
			required: ['userIds'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Gửi lời mời thành công',
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
		description: 'Không có quyền mời người dùng',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async inviteUsersToGroup(
		@Request() req,
		@Param('groupId') groupId: string,
		@Body('userIds') userIds: string[],
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.inviteUsersToGroup(groupId, userIds, req.user.id, i18n);

		return {
			success: true,
			message: i18n.t('group.INVITE_USERS_SUCCESS'),
		};
	}

	@Version('1')
	@Post(':groupId/invitation/accept')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Chấp nhận lời mời tham gia nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Chấp nhận lời mời thành công',
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
		status: 404,
		description: 'Không tìm thấy nhóm hoặc lời mời',
	})
	async acceptGroupInvitation(
		@Request() req,
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.acceptGroupInvitation(groupId, req.user.id, i18n);

		return {
			success: true,
			message: i18n.t('group.INVITATION_ACCEPTED_SUCCESS'),
		};
	}

	@Version('1')
	@Post(':groupId/invitation/reject')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Từ chối lời mời tham gia nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiResponse({
		status: 200,
		description: 'Từ chối lời mời thành công',
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
		status: 404,
		description: 'Không tìm thấy nhóm hoặc lời mời',
	})
	async rejectGroupInvitation(
		@Request() req,
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.rejectGroupInvitation(groupId, req.user.id, i18n);

		return {
			success: true,
			message: i18n.t('group.INVITATION_REJECTED_SUCCESS'),
		};
	}

	// ====== GROUP POSTS MANAGEMENT APIs ======

	@Version('1')
	@Get(':groupId/posts')
	@Public()
	@ApiOperation({ summary: 'Lấy danh sách bài viết của nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
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
		description: 'Số lượng bài viết trên mỗi trang (mặc định: 10)',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Lấy danh sách bài viết của nhóm thành công',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm hoặc bài viết',
	})
	async getGroupPosts(
		@Param('groupId') groupId: string,
		@I18n() i18n: I18nContext,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<ResponseEntity<any>> {
		const result = await this.postService.getPostsByGroupId(groupId, i18n, page, limit);
		return {
			success: true,
			data: result,
			message: i18n.t('group.GROUP_POST_RETRIEVED_SUCCESS'),
		};
	}

	@Version('1')
	@Put(':groupId/posts/:postId/approve')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Phê duyệt hoặc từ chối bài viết trong nhóm' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiParam({
		name: 'postId',
		description: 'ID của bài viết',
		example: '507f1f77bcf86cd799439099',
	})
	@ApiBody({
		description: 'Phê duyệt hoặc từ chối bài viết',
		schema: {
			type: 'object',
			properties: {
				approved: {
					type: 'boolean',
					description: 'Phê duyệt hoặc từ chối',
					example: true,
				},
				reason: {
					type: 'string',
					description: 'Lý do từ chối (nếu approved = false)',
					example: 'Nội dung không phù hợp',
				},
			},
			required: ['approved'],
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Phê duyệt bài viết thành công',
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
		description: 'Không có quyền phê duyệt bài viết',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm hoặc bài viết',
	})
	async approveGroupPost(
		@Request() req,
		@Param('postId') postId: string,
		@Body('approved') approved: boolean,
		@Body('reason') reason: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<any>> {
		// TODO: Optionally check if post belongs to groupId
		const result = await this.postService.approvePost(postId, approved, req.user.id, i18n, reason);
		return {
			success: true,
			data: result,
			message:
				approved ? i18n.t('group.POST_APPROVED_SUCCESS') : i18n.t('group.POST_REJECTED_SUCCESS'),
		};
	}

	@Version('1')
	@Post('post')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@UseInterceptors(FilesInterceptor('files'))
	@ApiOperation({ summary: 'Tạo bài viết mới trong nhóm' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Dữ liệu tạo bài viết',
		type: CreatePostDto,
	})
	@ApiResponse({
		status: 201,
		description: 'Tạo bài viết thành công',
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
		status: 404,
		description: 'Không tìm thấy nhóm',
	})
	async createGroupPost(
		@Request() req,
		@Body() createPostDto: CreatePostDto,
		@UploadedFiles() files: Express.Multer.File[],
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<any>> {
		const post = await this.groupService.createGroupPost(
			req.user.id,
			createPostDto,
			files,
			i18n,
			this.postService,
		);
		return {
			success: true,
			data: post,
			message: i18n.t('group.GROUP_POST_CREATED_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':groupId/members/:userId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Xóa thành viên khỏi nhóm (chỉ admin)' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiParam({
		name: 'userId',
		description: 'ID của thành viên cần xóa',
		example: '507f1f77bcf86cd799439012',
	})
	@ApiResponse({
		status: 200,
		description: 'Xóa thành viên thành công',
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
		description: 'Không có quyền xóa thành viên',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm hoặc thành viên',
	})
	async removeMemberFromGroup(
		@Request() req,
		@Param('groupId') groupId: string,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.removeMemberFromGroup(groupId, userId, req.user.id, i18n);
		return {
			success: true,
			message: i18n.t('group.MEMBER_REMOVED_SUCCESS'),
		};
	}

	@Version('1')
	@Delete(':groupId/invite/:userId')
	@UseGuards(RolesGuard)
	@Roles(Role.USER, Role.ADMIN)
	@ApiOperation({ summary: 'Hủy lời mời tham gia nhóm (chỉ admin)' })
	@ApiParam({
		name: 'groupId',
		description: 'ID của nhóm',
		example: '507f1f77bcf86cd799439011',
	})
	@ApiParam({
		name: 'userId',
		description: 'ID của người dùng được mời',
		example: '507f1f77bcf86cd799439012',
	})
	@ApiResponse({
		status: 200,
		description: 'Hủy lời mời thành công',
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
		description: 'Không có quyền hủy lời mời',
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhóm hoặc lời mời',
	})
	async cancelGroupInvitation(
		@Request() req,
		@Param('groupId') groupId: string,
		@Param('userId') userId: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseEntity<null>> {
		await this.groupService.cancelGroupInvitation(groupId, userId, req.user.id, i18n);
		return {
			success: true,
			message: i18n.t('group.INVITATION_CANCELLED_SUCCESS'),
		};
	}
}
