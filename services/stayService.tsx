import axios from "axios";

export interface Discount {
  label: string;
  percentage: number;
  sort: number;
}

export interface Stay {
  type: string;
  minNights: number;
  maxNights: number | null;
  sort: number;
  discounts: Discount[];
}

export async function fetchStayData(accessToken: string): Promise<Stay[]> {
  const response = await axios.get(
    "/webapi/items/Stay?fields=*,discounts.Discount_Config_id.*&deep[discounts][_sort]=Discount_Config_id.sort",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // 🔑 viene del padre
      },
    }
  );

  return response.data.data.map((item: any) => ({
    type: item.type,
    minNights: item.min_nights,
    maxNights: item.max_nights,
    sort: item.sort,
    discounts: item.discounts.map((d: any) => ({
      label: d.Discount_Config_id.discount_label,
      percentage: parseFloat(d.Discount_Config_id.discount_percentage),
      sort: d.Discount_Config_id.sort,
    })),
  }));
}
