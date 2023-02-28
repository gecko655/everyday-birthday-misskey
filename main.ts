import { DateTime } from 'luxon';
import { api as misskeyApi } from 'misskey-js';

const misskeyToken = process.env.MISSKEY_TOKEN!;
const year = Number(process.env.YEAR!);
const timezone = process.env.TIMEZONE || 'Asia/Tokyo'; // default to 'Asia/Tokyo' See: https://moment.github.io/luxon/#/tour?id=time-zones
// Check all required variables are set.
if (typeof misskeyToken == undefined || typeof year == undefined) {
	throw new Error('Some required ENV is not set (MISSKEY_TOKEN, YEAR)')
}

const currentDate = DateTime.now().setZone(timezone);
let todaysBirthday = DateTime.local(year, currentDate.month, currentDate.day, {zone: timezone});

// Check date is valid.
if(!todaysBirthday.isValid) {
	// Recover if today is leap year day
	if(todaysBirthday.month !== 2 || todaysBirthday.day !== 29) {
		throw new Error(`Invalid date ${todaysBirthday.toISODate()}`);
	}
	// In this case, today is leap year day(Feb 29th) but your birth year does not have that day.
	// Find other year that fits leap year day as your birthday.
	while(!todaysBirthday.isValid) {
		todaysBirthday = DateTime.local(todaysBirthday.year-1, todaysBirthday.month, todaysBirthday.day)
	}
}

const cli = new misskeyApi.APIClient({
	origin: 'https://misskey.io',
	credential: misskeyToken,
});

(async () => {
	const meta = await cli.request('i/update', {birthday: todaysBirthday.toISODate()});
	console.log(meta);
})().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
