import {Update} from 'common/types/server-requests'

export async function loadUpdates(): Promise<Array<Update> | null> {
	let res = await fetch('https://api.github.com/repos/hc-tcg/hc-tcg/releases')
	if (!res || res.status !== 200) {
		console.error('Could not fetch releases')
		return null
	}

	let releases: any = await res.json()

	let out: Array<Update> = []

	for (const release of releases) {
		out.push({
			tag: release.tag_name,
			description: release.body,
			link: release.html_url,
			timestamp:
				new Date(release.created_at).valueOf() /
				1000 /** We need the update time in seconds, not ms */,
		})
	}

	return out
}
