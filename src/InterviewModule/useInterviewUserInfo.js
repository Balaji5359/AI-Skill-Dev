import { useEffect, useState } from "react";
import { profileAPI, platformAPI } from "../services/api";

const getUserType = (profile) => {
    const userType = profile?.user_info?.user_type || profile?.user_type || 'free';
    const paymentDetails = profile?.user_info?.payment_details || profile?.payment_details || {};
    return userType === 'premium' && paymentDetails?.status === 'success' ? 'premium' : 'free';
};

const useInterviewUserInfo = () => {
    const [userType, setUserType] = useState("free");
    const [streakData, setStreakData] = useState({ current_streak: 0 });
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (!storedEmail) return;

        const fetchUserData = async () => {
            try {
                const [profile, streak] = await Promise.all([
                    profileAPI.get(storedEmail),
                    platformAPI.updateStreak(storedEmail, true)
                ]);

                if (profile?.statusCode === 200) {
                    setProfileData(profile);
                    setUserType(getUserType(profile));
                }

                if (streak?.statusCode === 200) {
                    setStreakData(streak);
                }
            } catch (error) {
                console.error("Error fetching interview user data:", error);
            }
        };

        fetchUserData();
    }, []);

    return {
        userType,
        streakData,
        profileData,
        email: profileData?.college_email || localStorage.getItem("email") || "",
        isPremium: userType === "premium",
    };
};

export default useInterviewUserInfo;
