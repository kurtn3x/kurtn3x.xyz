import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet, apiPost, apiDelete } from 'src/api/apiWrapper';

export interface ShortLink {
  id: string;
  linkId: string;
}

export const useLinkOperationsStore = defineStore('linkOperations', () => {
  // Get Quasar instance for notifications and cookies
  const q = useQuasar();

  // State
  const loading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');
  const shortLinks = ref<ShortLink[]>([]);

  // HTTP config
  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // Get permanent link for an item
  function getItemShareLink(itemType: string, itemId: string): string {
    return `kurtn3x.xyz/files/${itemType}/${itemId}`;
  }

  // Get short link url
  function getShortLinkUrl(linkId: string): string {
    return `https://kurtn3x.xyz/files/sl/${linkId}`;
  }

  // Fetch short links for an item
  async function getShortLinks(itemType: string, itemId: string) {
    loading.value = true;
    error.value = false;

    const apiData = await apiGet(`/files/item-shortlinks/${itemType}/${itemId}`, axiosConfig);

    if (apiData.error === false) {
      shortLinks.value = apiData.data as ShortLink[];
    } else {
      error.value = true;
      errorMessage.value = apiData.errorMessage;
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    loading.value = false;

    return !error.value;
  }

  // Create a new short link
  async function createShortLink(
    itemType: string,
    itemId: string,
    options: { random: boolean; linkId?: string },
  ) {
    loading.value = true;
    error.value = false;

    const data = {
      random: options.random,
      objectType: itemType,
      objectId: itemId,
      linkId: options.linkId || '',
    };

    const apiData = await apiPost('/files/shortlink', data, axiosConfig);

    if (apiData.error === false) {
      // Refresh the list after creating a new link
      await getShortLinks(itemType, itemId);
      q.notify({
        type: 'positive',
        message: 'Short link created successfully',
      });
    } else {
      error.value = true;
      errorMessage.value = apiData.errorMessage;
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    loading.value = false;

    return !error.value;
  }

  // Delete a short link
  async function deleteShortLink(id: string, itemType: string, itemId: string) {
    loading.value = true;
    error.value = false;

    const apiData = await apiDelete(`/files/sl/${id}`, axiosConfig);

    if (apiData.error === false) {
      // Refresh the list after deleting
      await getShortLinks(itemType, itemId);
      q.notify({
        type: 'positive',
        message: 'Short link deleted successfully',
      });
    } else {
      error.value = true;
      errorMessage.value = apiData.errorMessage;
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    loading.value = false;

    return !error.value;
  }

  // Return state and methods
  return {
    // State
    loading,
    error,
    errorMessage,
    shortLinks,

    // Methods
    getItemShareLink,
    getShortLinkUrl,
    getShortLinks,
    createShortLink,
    deleteShortLink,
  };
});
