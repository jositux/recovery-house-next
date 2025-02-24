import { useState, useEffect } from "react";
import axios from "axios";

export const useCheckOwnership = (id: string) => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          const currentUserResponse = await axios.get("/webapi/users/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const propertyResponse = await axios.get(
            `/webapi/items/Property/${id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const isCurrentUserOwner =
            currentUserResponse.data.id === propertyResponse.data.data.userId;

          setIsOwner(isCurrentUserOwner);
        }
      } catch (error) {
        console.error("Error checking ownership:", error);
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [id]);

  return { isOwner, loading };
};
