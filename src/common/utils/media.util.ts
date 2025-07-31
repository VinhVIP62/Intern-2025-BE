export function mapMimeTypeToType(mimeType: string): 'image' | 'video' | 'audio' | 'file' {
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	return 'file';
}
