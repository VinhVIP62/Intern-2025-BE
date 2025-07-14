import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsGeoCoordinates(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isGeoCoordinates',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					if (
						!Array.isArray(value) ||
						value.length !== 2 ||
						typeof value[0] !== 'number' ||
						typeof value[1] !== 'number'
					) {
						return false;
					}

					const lng = value[0];
					const lat = value[1];
					return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
				},
				defaultMessage(): string {
					return 'coordinates must be an array [lng, lat] with valid values';
				},
			},
		});
	};
}
