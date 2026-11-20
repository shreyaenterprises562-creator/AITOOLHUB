'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CustomerLocation, CatalogCategory, CatalogProduct } from '../types/catalog';
import { INITIAL_LOCATION, AVAILABLE_DELIVERY_ZONES } from '../data/fixtures';
import { getStoreCategories, getStoreProducts } from '../services/catalog.service';
import { getStoredLocation, saveStoredLocation } from '../services/location.service';
import { platformConfig } from '../config/platform.config';

import { CartProvider, useCart } from '../context/CartContext';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerHero } from '../components/customer/CustomerHero';
import { DeliveryBenefitStrip } from '../components/customer/DeliveryBenefitStrip';
import { CategorySection } from '../components/customer/CategorySection';
import { ProductSection } from '../components/customer/ProductSection';
import { ProductCarousel } from '../components/customer/ProductCarousel';
import { ProductGridSection } from '../components/customer/ProductGridSection';
import { TopPromoBanner } from '../components/customer/TopPromoBanner';
import { MidPromoBanner } from '../components/customer/MidPromoBanner';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { LocationSelectorModal } from '../components/customer/LocationSelectorModal';
import { MobileBottomNav } from '../components/customer/MobileBottomNav';
import { CartDrawer } from '../components/customer/CartDrawer';
import { SellerConflictModal } from '../components/customer/SellerConflictModal';
import { CartToast } from '../components/customer/CartToast';

function StorefrontContent() {
  // 1. Location State (Hydrated from localStorage or default unselected)
  const [location, setLocation] = useState<CustomerLocation>(INITIAL_LOCATION);
  const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // 2. Search & Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'home' | 'categories' | 'search' | 'account'>('home');

  // 3. Catalog Data State
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 4. Cart Context Hook
  const {
    items,
    cartCount,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addToCart,
    updateQuantity,
  } = useCart();

  // Map of product.id -> quantity for quick-commerce product card stepper
  const cartQuantities = useMemo(() => {
    const qMap: Record<string, number> = {};
    items.forEach((item) => {
      qMap[item.product.id] = item.quantity;
    });
    return qMap;
  }, [items]);

  // Hydrate persisted customer location from localStorage on client mount
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
      setIsLocationSelected(true);
    }
  }, []);

  // Load Categories & Products on initial mount
  useEffect(() => {
    async function loadStorefrontData() {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          getStoreCategories(),
          getStoreProducts(),
        ]);
        setCategories(cats);
        setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load storefront catalog:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorefrontData();
  }, []);

  // Filtered Products computation for main catalog grid
  const filteredProducts = useMemo(() => {
    let prods = [...allProducts];

    if (selectedCategory !== 'all') {
      prods = prods.filter((p) => p.categorySlug === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return prods;
  }, [allProducts, selectedCategory, searchQuery]);

  // Active Category Display Name
  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'All Products';
    const found = categories.find((c) => c.slug === selectedCategory);
    return found ? found.name : 'Category Products';
  }, [selectedCategory, categories]);

  // Segmented products for quick-commerce home storefront layout
  const quickPicks = useMemo(() => {
    const featured = allProducts.filter((p) => p.isFeatured);
    return featured.length >= 4 ? featured.slice(0, 8) : allProducts.slice(0, 8);
  }, [allProducts]);

  const floorCleaners = useMemo(() => {
    return allProducts.filter((p) => p.categorySlug === 'floor-cleaner');
  }, [allProducts]);

  const bathroomAndToilet = useMemo(() => {
    return allProducts.filter(
      (p) => p.categorySlug === 'bathroom-cleaner' || p.categorySlug === 'toilet-cleaner'
    );
  }, [allProducts]);

  const bestSellers = useMemo(() => {
    const popularBrands = ['Lizol', 'Harpic', 'Colin', 'Dettol', 'Vim'];
    const popular = allProducts.filter((p) => popularBrands.includes(p.brand));
    return popular.length >= 4 ? popular.slice(0, 6) : allProducts.slice(0, 6);
  }, [allProducts]);

  const isFiltering = searchQuery.trim() !== '' || selectedCategory !== 'all';

  // Manual locality selector zone selection
  const handleSelectZone = (zone: (typeof AVAILABLE_DELIVERY_ZONES)[0]) => {
    const updatedLocation: CustomerLocation = {
      city: platformConfig.initialServiceArea.city,
      state: platformConfig.initialServiceArea.state,
      area: `${zone.name}, ${platformConfig.initialServiceArea.city}`,
      postalCode: zone.postalCode,
      latitude: platformConfig.initialServiceArea.centerLatitude,
      longitude: platformConfig.initialServiceArea.centerLongitude,
      isWithinRadius: true,
      serviceRadiusKm: platformConfig.initialServiceArea.radiusKm,
      selectionType: 'manual',
      distanceKm: zone.distanceKm,
      deliveryFee: zone.deliveryFee,
      serviceable: true,
      serviceAreaName: platformConfig.initialServiceArea.name,
    };
    setLocation(updatedLocation);
    setIsLocationSelected(true);
    saveStoredLocation(updatedLocation);
  };

  // GPS detected location selection
  const handleSelectGpsLocation = (detectedLocation: CustomerLocation) => {
    setLocation(detectedLocation);
    setIsLocationSelected(true);
    saveStoredLocation(detectedLocation);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileTabChange = (tab: 'home' | 'categories' | 'search' | 'account') => {
    setMobileTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      const el = document.getElementById('categories-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'search') {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-[#FFD000] selection:text-black pb-16 md:pb-0 overflow-x-hidden">
      {/* 1. Header: Logo + Location + Cart, with Search below */}
      <CustomerHeader
        location={location}
        isLocationSelected={isLocationSelected}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenCartDrawer={openDrawer}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 overflow-x-hidden">
        {/* 2. Compact Category Section (Horizontal scrolling icon chips) */}
        <CategorySection
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            if (slug !== 'all') {
              handleScrollToProducts();
            }
          }}
        />

        {isFiltering ? (
          /* Focused Product Section when user searches or selects a category */
          <ProductSection
            products={filteredProducts}
            selectedCategoryName={selectedCategoryName}
            searchQuery={searchQuery}
            cartQuantities={cartQuantities}
            onAddToCart={addToCart}
            onUpdateQuantity={updateQuantity}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
          />
        ) : (
          /* Structured Quick-Commerce Home Storefront Layout */
          <div id="products-section" className="space-y-1">
            {/* 3. Feature / Priority Banner */}
            <TopPromoBanner onCtaClick={handleScrollToProducts} />

            {/* 4. Featured / Quick Picks (Horizontal Carousel, ~3 cards per mobile viewport) */}
            <ProductCarousel
              title="⚡ Quick Picks"
              subtitle="Everyday cleaning staples dispatched first"
              accentColor="bg-[#FFD000]"
              products={quickPicks}
              cartQuantities={cartQuantities}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
              onViewAll={() => {
                setSelectedCategory('all');
                handleScrollToProducts();
              }}
            />

            {/* 5. Floor Cleaners (2-Column Vertical Grid) */}
            <ProductGridSection
              title="🧹 Floor Cleaners"
              subtitle="Surface sanitizers & tile cleaning liquids"
              accentColor="bg-emerald-500"
              badge="Daily Hygiene"
              badgeColor="bg-emerald-100 text-emerald-900 border-emerald-200"
              products={floorCleaners}
              cartQuantities={cartQuantities}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
              onViewAll={() => {
                setSelectedCategory('floor-cleaner');
                handleScrollToProducts();
              }}
              limit={4}
            />

            {/* 6. Second Promotional Banner */}
            <MidPromoBanner onCtaClick={handleScrollToProducts} />

            {/* 7. Bathroom & Toilet Care (Horizontal Carousel, ~3 cards per mobile viewport) */}
            <ProductCarousel
              title="🚿 Bathroom & Toilet Care"
              subtitle="Stain removers, bowl cleaners & limescale defense"
              accentColor="bg-sky-500"
              products={bathroomAndToilet}
              cartQuantities={cartQuantities}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
              onViewAll={() => {
                setSelectedCategory('bathroom-cleaner');
                handleScrollToProducts();
              }}
            />

            {/* 8. Popular / Best Sellers (2-Column Vertical Grid) */}
            <ProductGridSection
              title="⭐ Popular Cleaning Essentials"
              subtitle="Top-rated products trusted by Rajkot homes"
              accentColor="bg-[#E60028]"
              badge="Top Picks"
              badgeColor="bg-red-100 text-red-900 border-red-200"
              products={bestSellers}
              cartQuantities={cartQuantities}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
              onViewAll={() => {
                setSelectedCategory('all');
                handleScrollToProducts();
              }}
              limit={6}
            />

            {/* 9. Official Delivery Benefit Strip */}
            <DeliveryBenefitStrip
              location={location}
              isLocationSelected={isLocationSelected}
            />
          </div>
        )}
      </main>

      {/* 6. Customer Footer */}
      <CustomerFooter />

      {/* 7. Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        onTabChange={handleMobileTabChange}
        onOpenCart={openDrawer}
        cartCount={cartCount}
      />

      {/* 8. Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        isLocationSelected={isLocationSelected}
        onSelectZone={handleSelectZone}
        onSelectGpsLocation={handleSelectGpsLocation}
      />

      {/* 9. Customer Cart Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        location={location}
        isLocationSelected={isLocationSelected}
        onOpenLocationModal={() => {
          closeDrawer();
          setIsLocationModalOpen(true);
        }}
        onBrowseProducts={handleScrollToProducts}
      />

      {/* 10. Single-Seller Conflict Confirmation Modal */}
      <SellerConflictModal />

      {/* 11. Non-blocking Toast Feedback */}
      <CartToast />
    </div>
  );
}

export default function CustomerStorefrontPage() {
  return <StorefrontContent />;
}
