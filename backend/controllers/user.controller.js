import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

// Tüm controller fonksiyonlarını dışa aktarıyoruz
export const getSuggestedConnections = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id).select("connections");

		// find users who are not already connected, and also do not recommend our own profile!! right?
		const suggestedUser = await User.find({
			_id: {
				$ne: req.user._id,
				$nin: currentUser.connections,
			},
		})
			.select("name username profilePicture headline")
			.limit(3);

		res.json(suggestedUser);
	} catch (error) {
		console.error("Error in getSuggestedConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Bu fonksiyon doğru dışa aktarıldığından emin olun
export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
			"profilePicture",
			"bannerImg",
			"skills",
			"experience",
			"education",
		];

		const updatedData = {};

		for (const field of allowedFields) {
			if (req.body[field]) {
				updatedData[field] = req.body[field];
			}
		}

		if (req.body.profilePicture) {
			const result = await cloudinary.uploader.upload(req.body.profilePicture);
			updatedData.profilePicture = result.secure_url;
		}

		if (req.body.bannerImg) {
			const result = await cloudinary.uploader.upload(req.body.bannerImg);
			updatedData.bannerImg = result.secure_url;
		}

		const user = await User.findByIdAndUpdate(req.user._id, { $set: updatedData }, { new: true }).select(
			"-password"
		);

		res.json(user);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const searchUsers = async (req, res) => {
	try {
		const { query } = req.query;
		
		console.log("Received search query:", query);
		
		if (!query) {
			console.log("Search query is empty");
			return res.status(400).json({ message: "Search query is required" });
		}
		
		// Regex kullanarak isim, username veya headline'da arama yapma
		const searchParams = {
			$or: [
				{ name: { $regex: query, $options: "i" } },
				{ username: { $regex: query, $options: "i" } },
				{ headline: { $regex: query, $options: "i" } }
			],
			_id: { $ne: req.user._id } // Kendimizi aramalarda göstermemek için
		};
		
		console.log("Search parameters:", JSON.stringify(searchParams));
		
		const users = await User.find(searchParams)
		.select("name username profilePicture headline connections")
		.limit(10);
		
		console.log(`Found ${users.length} users for query "${query}"`);
		
		res.status(200).json(users);
	} catch (error) {
		console.error("Error in searchUsers controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};