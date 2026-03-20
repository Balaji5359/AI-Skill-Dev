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
        const cachedUserType = localStorage.getItem("user_type");
        const cachedCurrent = Number(localStorage.getItem("streak_current") || 0);
        const cachedLongest = Number(localStorage.getItem("streak_longest") || 0);

        if (cachedUserType) {
            setUserType(cachedUserType === "premium" ? "premium" : "free");
        }
        if (cachedCurrent || cachedLongest) {
            setStreakData({
                current_streak: cachedCurrent,
                longest_streak: cachedLongest,
            });
        }

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
                    const resolvedUserType = getUserType(profile);
                    setUserType(resolvedUserType);
                    localStorage.setItem("user_type", resolvedUserType);
                }

                if (streak?.statusCode === 200) {
                    setStreakData(streak);
                    localStorage.setItem("streak_current", String(streak.current_streak || 0));
                    localStorage.setItem("streak_longest", String(streak.longest_streak || 0));
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
