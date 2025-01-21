import axios from 'axios'

export interface MembershipTag {
  id: string
  name: string
  description: string
  priceYear: string
}

export interface MembershipResponse {
  data: MembershipTag[]
}

const API_URL = '/webapi/items/MembershipTags'

export const getMembershipTags = async (): Promise<MembershipTag[]> => {
  try {
    const response = await axios.get<MembershipResponse>(API_URL)
    return response.data.data
  } catch (error) {
    console.error('Error fetching membership tags:', error)
    return []
  }
}

