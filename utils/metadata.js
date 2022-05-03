const axios = require("axios");

const getIPFSURL = (uri) => uri.split("://");

const fetchMetadata = async (uri) => {
	const urlParts = getIPFSURL(uri);
	const [prefix, ipfsURL] = urlParts;
	console.log({ prefix, ipfsURL });
	let metadata;
	metadata = await axios.get(
		prefix === "ipfs" ? `https://ipfs.io/ipfs/${ipfsURL}` : uri,
	);
	return {
		name: metadata.data.name,
		image:
			prefix === "ipfs"
				? `https://ipfs.io/ipfs/${getIPFSURL(metadata.data.image)[1]}`
				: metadata.data.image,
	};
};

module.exports = { fetchMetadata };
