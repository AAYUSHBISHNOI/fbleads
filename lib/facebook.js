import axios from 'axios';

export async function getLeadData(leadId) {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${leadId}?access_token=${accessToken}`
    );
    return response.data;
  } catch (error) {
    console.error('Facebook API error:', error.response?.data || error.message);
    throw error;
  }
}
