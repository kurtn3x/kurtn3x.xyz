import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import type { NavbarIndexType } from 'src/types/localTypes';

export const useNavigationStore = defineStore('navigation', () => {
  // Navbar state
  const navbarIndex = reactive<NavbarIndexType>({
    homeFolderId: '',
    navbarItems: [],
    menuItems: [],
    lastMovedItemId: '',
  });

  // Computed properties
  const currentFolderId = computed(() => {
    if (navbarIndex.navbarItems.length > 0) {
      return navbarIndex.navbarItems[navbarIndex.navbarItems.length - 1]!.id;
    }
    return navbarIndex.homeFolderId;
  });

  const breadcrumbItems = computed(() => {
    return [
      { id: navbarIndex.homeFolderId, name: 'Home', icon: 'home' },
      ...navbarIndex.navbarItems,
    ];
  });

  function setHomeFolderId(id: string) {
    navbarIndex.homeFolderId = id;
  }

  function addNavbarItem(item: { name: string; id: string }) {
    navbarIndex.navbarItems.push(item);
  }

  function clearNavigation() {
    navbarIndex.navbarItems = [];
    navbarIndex.menuItems = [];
  }

  function navigateToHome() {
    clearNavigation();
    return navbarIndex.homeFolderId;
  }

  function navigateUp() {
    if (navbarIndex.navbarItems.length > 0) {
      navbarIndex.navbarItems.pop();
      return currentFolderId.value;
    }
    return navbarIndex.homeFolderId;
  }

  function navigateTo(index: number) {
    if (index === -1) {
      clearNavigation();
      return navbarIndex.homeFolderId;
    } else if (index >= 0 && index < navbarIndex.navbarItems.length) {
      navbarIndex.navbarItems = navbarIndex.navbarItems.slice(0, index + 1);
      return navbarIndex.navbarItems[index]!.id;
    }
    return currentFolderId.value;
  }

  function setLastMovedItemId(id: string) {
    navbarIndex.lastMovedItemId = id;
  }

  return {
    // State
    navbarIndex,

    // Computed
    currentFolderId,
    breadcrumbItems,

    // Methods
    setHomeFolderId,
    addNavbarItem,
    clearNavigation,
    navigateToHome,
    navigateUp,
    navigateTo,
    setLastMovedItemId,
  };
});
