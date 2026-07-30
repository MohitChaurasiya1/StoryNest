import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentRewardsApi, parentStreakApi } from '../../services/api';
import { FaStore, FaStar, FaShoppingBag, FaCheck, FaLock } from 'react-icons/fa';

export default function RewardsShop() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [shopItems, setShopItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchShop = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const items = await parentRewardsApi.getShopItems();
      setShopItems(Array.isArray(items) ? items : items?.results || []);

      const bought = await parentRewardsApi.getPurchases(activeChildId);
      setPurchases(Array.isArray(bought) ? bought : bought?.results || []);

      const streak = await parentStreakApi.getStreak(activeChildId);
      setStars(streak.total_stars || 0);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load rewards shop' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [activeChildId]);

  const handleBuy = async (item) => {
    if (stars < item.cost_stars) {
      setToast({ type: 'error', message: 'Not enough stars!' });
      return;
    }
    try {
      await parentRewardsApi.purchaseItem(activeChildId, item.id);
      setToast({ type: 'success', message: `Unlocked ${item.name}!` });
      fetchShop();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to purchase reward' });
    }
  };

  const purchasedItemIds = new Set(purchases.map((p) => p.item || p.item_details?.id));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Rewards Shop" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaStore className="text-amber-500" /> Star Rewards Shop
              </h1>
              <p className="text-sm text-slate-500">Unlock avatars, themes, and badges using earned reading stars for {activeChild?.name}.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-2xl font-extrabold text-sm shadow-sm">
                <FaStar className="text-amber-500 text-base" /> {stars} Stars Available
              </div>
              <ChildSelector
                childrenList={childrenList}
                activeChildId={activeChildId}
                onSelectChild={setActiveChildId}
              />
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={6} />
          ) : shopItems.length === 0 ? (
            <EmptyState
              icon={FaStore}
              title="Shop empty"
              description="No reward items currently available in the store."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shopItems.map((item) => {
                const isOwned = purchasedItemIds.has(item.id);
                return (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-3xl p-3 bg-slate-100 rounded-2xl">{item.emoji}</span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full flex items-center gap-1">
                          <FaStar className="text-amber-400" /> {item.cost_stars} Stars
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 capitalize">Category: {item.category}</p>
                      <p className="text-xs text-slate-600 mt-2">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isOwned || stars < item.cost_stars}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                        isOwned
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : stars < item.cost_stars
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md hover:scale-105'
                      }`}
                    >
                      {isOwned ? (
                        <> <FaCheck /> Unlocked </>
                      ) : stars < item.cost_stars ? (
                        <> <FaLock /> Need {item.cost_stars - stars} More Stars </>
                      ) : (
                        <> <FaShoppingBag /> Unlock Reward </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
