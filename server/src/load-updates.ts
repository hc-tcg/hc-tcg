export async function loadUpdates(): Promise<Record<string, string> | null> {
	let res = await fetch('https://api.github.com/repos/hc-tcg/hc-tcg/releases')
	if (!res || res.status !== 200) {
		console.error('Could not fetch releases')
		return null
	}

	let releases: any = await res.json()

	let out: any = {}

	for (const release of releases) {
		out[release.tag_name as string] = release.body
	}

	return out
}
