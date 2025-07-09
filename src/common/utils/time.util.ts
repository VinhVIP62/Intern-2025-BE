export function checkCooldown(lastTime?: Date, cooldownMinutes = 10080): boolean {
	if (!lastTime) return false;
	const now = new Date();
	const diff = now.getTime() - lastTime.getTime();
	return diff >= cooldownMinutes * 60 * 1000;
}
