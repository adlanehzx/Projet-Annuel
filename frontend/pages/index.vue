<template>
  <div>
    <div style="background:#14171F;color:#F1F0EC;position:relative;overflow:hidden;padding:0">
      <div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 80% -10%,rgba(53,64,140,0.55),transparent 60%)"></div>
      
      <div style="position:relative;display:flex;align-items:center;gap:40px;max-width:1200px;margin:0 auto;padding:60px 24px;flex-wrap:wrap">
        <div style="flex:1;min-width:0;max-width:560px">
          <div style="display:inline-block;padding:6px 14px;border:1px solid rgba(255,255,255,0.2);border-radius:999px;font-family:var(--font-mono);font-size:12px;color:#C9CAD1;margin-bottom:22px">Le carnet de bord des otaku</div>
          <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:3px;color:#E08776;margin-bottom:18px">SUIVEZ · NOTEZ · COLLECTIONNEZ</div>
          <h1 style="font-family:var(--font-display);font-weight:700;font-size:52px;line-height:1.2;color:#F1F0EC;margin:0 0 24px;max-width:480px">Votre carnet d'anime, tenu au sceau près.</h1>
          <p style="font-family:var(--font-body);font-size:17px;line-height:1.6;color:#C6C4CE;margin:0 0 30px;max-width:460px">Cataloguez ce que vous regardez, avancez épisode par épisode, notez et rédigez vos critiques. Chaque série terminée reçoit son cachet vermillon.</p>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:34px">
            <NuxtLink to="/auth/register" style="padding:15px 28px;background:var(--color-accent-primary);color:#FFFFFF;border:none;border-radius:9px;font-family:var(--font-body);font-weight:500;font-size:16px;text-decoration:none;text-align:center">Créer mon compte</NuxtLink>
            <NuxtLink to="/animes" style="padding:15px 22px;background:none;border:1px solid rgba(255,255,255,0.25);border-radius:9px;font-family:var(--font-body);font-weight:500;font-size:16px;color:#F1F0EC;text-decoration:none;text-align:center">Voir le catalogue →</NuxtLink>
          </div>
          <div style="display:flex;gap:34px;flex-wrap:wrap">
            <div>
              <div style="font-family:var(--font-display);font-weight:700;font-size:26px;color:#F1F0EC">{{ stats.animes }}</div>
              <div style="font-family:var(--font-mono);font-size:12px;color:#9C9AA6;margin-top:2px">Animes catalogués</div>
            </div>
            <div>
              <div style="font-family:var(--font-display);font-weight:700;font-size:26px;color:#F1F0EC">{{ stats.users }}</div>
              <div style="font-family:var(--font-mono);font-size:12px;color:#9C9AA6;margin-top:2px">Collectionneurs</div>
            </div>
            <div>
              <div style="font-family:var(--font-display);font-weight:700;font-size:26px;color:#F1F0EC">{{ stats.reviews }}</div>
              <div style="font-family:var(--font-mono);font-size:12px;color:#9C9AA6;margin-top:2px">Critiques écrites</div>
            </div>
          </div>
        </div>

        <div style="flex-shrink:0;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:30rem;max-width:100%;transform:rotate(-4deg)">
          <div
            v-for="(poster, idx) in topPosters"
            :key="idx"
            :style="`position:relative;aspect-ratio:2/3;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${poster.bg};color:${poster.fg};font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:2px;border:1px solid rgba(0,0,0,0.12);box-shadow:0 8px 24px rgba(0,0,0,0.3)`"
          >
            <img v-if="poster.image" :src="poster.image" :alt="poster.title" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
            <span v-else>{{ poster.mon }}</span>
            <div
              v-if="poster.completed"
              style="position:absolute;inset:0;pointer-events:none;z-index:1;background:rgba(0,0,0,0.26)"
            />
            <BrandSeal
              v-if="poster.completed"
              :size="72"
              format="png"
              style="position:absolute;right:-6px;bottom:-6px;z-index:2;opacity:1;transform:rotate(12deg);filter:drop-shadow(0 8px 12px rgba(0,0,0,0.45))"
            />
          </div>
        </div>
      </div>
    </div>

    <div style="background:var(--bg);color:var(--text-primary);padding:66px 24px">
      <div style="max-width:1100px;margin:0 auto">
        <div style="text-align:center;max-width:560px;margin:0 auto 40px">
          <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:2px;color:var(--color-accent-primary);margin-bottom:10px">FONCTIONNALITÉS</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:30px;margin:0">Tout pour tenir votre historique</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px">
          <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:26px">
            <div style="width:48px;height:48px;border-radius:10px;background:transparent;display:flex;align-items:center;justify-content:center;margin-bottom:16px;overflow:hidden">
              <img src="/assets/images/stats-feature-icon-v2.svg" alt="Statistiques" style="width:48px;height:48px;object-fit:contain" />
            </div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--text-primary);margin-bottom:8px">Suivez vos progrès</div>
            <div style="font-family:var(--font-body);font-size:14px;line-height:1.55;color:var(--text-secondary)">Gérez votre watchlist avec 5 statuts différents — À voir, En cours, Terminé, Abandonné, En pause.</div>
          </div>
          <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:26px">
            <div style="width:48px;height:48px;border-radius:10px; ;display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:16px">
              <img src="/assets/images/4-etoiles.png" alt="Notations et critiques" style="width:48px;height:48px;object-fit:contain" />
            </div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--text-primary);margin-bottom:8px">Notez et critiquez</div>
            <div style="font-family:var(--font-body);font-size:14px;line-height:1.55;color:var(--text-secondary)">Rédigez des critiques détaillées avec une note de 0 à 10 pour chaque série.</div>
          </div>
          <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:26px">
            <div style="width:48px;height:48px;border-radius:10px; ;display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:16px">
              <img src="/assets/images/liste-de-controle.png" alt="Listes personnalisées" style="width:48px;height:48px;object-fit:contain" />
            </div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--text-primary);margin-bottom:8px">Créez vos listes</div>
            <div style="font-family:var(--font-body);font-size:14px;line-height:1.55;color:var(--text-secondary)">Organisez vos animes en listes personnalisées, publiques ou privées.</div>
          </div>
          <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:26px">
            <div style="width:48px;height:48px;border-radius:10px; ;display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:16px">
              <img src="/assets/images/des-medias-sociaux.png" alt="Recommendations" style="width:48px;height:48px;object-fit:contain" />
            </div>            
            <div style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--text-primary);margin-bottom:8px">Découvrez des recommandations</div>
            <div style="font-family:var(--font-body);font-size:14px;line-height:1.55;color:var(--text-secondary)">Recevez des suggestions personnalisées selon votre historique.</div>
          </div>
        </div>
      </div>
    </div>

    <div style="background:var(--bg-elevated);color:var(--text-primary);padding:70px 24px">
      <div style="max-width:1000px;margin:0 auto">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:48px;flex-wrap:wrap">
          <div>
            <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:2px;color:var(--color-accent-primary);margin-bottom:10px">COMMENT ÇA MARCHE</div>
            <h2 style="font-family:var(--font-display);font-weight:700;font-size:30px;margin:0">En trois gestes</h2>
          </div>
          <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);padding-bottom:6px">~ 2 minutes pour démarrer</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;position:relative">
          <div>
            <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:20px;min-height:168px;display:flex;flex-direction:column;gap:10px;justify-content:center;box-shadow:var(--shadow-sm)">
              <div style="display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid var(--border);border-radius:8px;padding:11px;font-size:13px;font-weight:500">
                <img :src="githubLogo" alt="Logo GitHub" style="width:22px;height:22px;object-fit:contain;display:block" />
                <span>Continuer avec GitHub</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:center;gap:9px;background:var(--color-accent-primary);color:#fff;border-radius:8px;padding:11px;font-size:13px;font-weight:500">Créer un compte par email</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin:20px 0 8px">
              <span style="font-family:var(--font-mono);font-size:13px;color:var(--color-accent-primary)">01</span>
              <span style="flex:1;border-top:1px solid var(--border)"></span>
            </div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px;margin-bottom:6px">Connectez-vous</div>
            <div style="font-size:14px;line-height:1.55;color:var(--text-secondary)">GitHub ou email en un clic, sécurisé par double authentification.</div>
          </div>

          <div>
            <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:20px;min-height:168px;display:flex;align-items:center;gap:14px;box-shadow:var(--shadow-sm)">
              <img
                src="https://image.tmdb.org/t/p/w342/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg"
                alt="Affiche Fullmetal Alchemist: Brotherhood"
                style="width:62px;aspect-ratio:2/3;border-radius:6px;object-fit:cover;display:block;flex-shrink:0"
              />
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:500;margin-bottom:3px">Fullmetal Alchemist: Brotherhood</div>
                <div style="font-family:var(--font-mono);font-size:11px;margin-bottom:10px"><span style="color:var(--rating);font-weight:500">★ 9.1</span><span style="color:var(--text-secondary)"> · 2019</span></div>
                <div style="display:inline-flex;align-items:center;gap:7px;background:var(--color-accent-primary);color:#fff;border-radius:7px;padding:8px 13px;font-size:12.5px;font-weight:500">+ Ajouter</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin:20px 0 8px">
              <span style="font-family:var(--font-mono);font-size:13px;color:var(--color-accent-primary)">02</span>
              <span style="flex:1;border-top:1px solid var(--border)"></span>
            </div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px;margin-bottom:6px">Ajoutez vos animes</div>
            <div style="font-size:14px;line-height:1.55;color:var(--text-secondary)">Parcourez le catalogue et rangez chaque titre dans votre watchlist.</div>
          </div>

          <div>
            <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:14px;padding:20px;min-height:168px;display:flex;flex-direction:column;justify-content:center;gap:12px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden">
              <div style="font-size:13.5px;font-weight:500">Fullmetal Alchemist: Brotherhood</div>
              <div style="height:7px;border-radius:999px;background:var(--border);overflow:hidden"><div style="width:100%;height:100%;background:var(--color-accent-primary);border-radius:999px"></div></div>
              <div style="display:flex;align-items:center;justify-content:space-between"><span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">26 / 26 épisodes</span><span style="font-family:var(--font-mono);font-size:11px;letter-spacing:1px;color:var(--color-accent-primary)">TERMINÉ</span></div>
              <BrandSeal :size="52" format="svg" style="position:absolute;right:10px;top:8px;opacity:0.95;transform:rotate(10deg)" />
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin:20px 0 8px">
              <span style="font-family:var(--font-mono);font-size:13px;color:var(--color-accent-primary)">03</span>
              <span style="flex:1;border-top:1px solid var(--border)"></span>
            </div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px;margin-bottom:6px">Suivez &amp; tamponnez</div>
            <div style="font-size:14px;line-height:1.55;color:var(--text-secondary)">Avancez épisode par épisode — le sceau tombe à la fin de la série.</div>
          </div>
        </div>
      </div>
    </div>

    <div style="background:var(--bg);color:var(--text-primary);padding:64px 24px">
      <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:auto 1fr;gap:48px;align-items:center">
        <div style="display:flex;justify-content:center;flex-shrink:0">
          <BrandSeal :size="150" format="svg" style="transform:rotate(8deg)" />
        </div>
        <div>
          <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:2px;color:var(--text-secondary);margin-bottom:12px">LA SIGNATURE</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:32px;margin:0 0 16px;line-height:1.1">Le sceau hanko, votre marque d'achèvement.</h2>
          <p style="font-size:16px;line-height:1.65;color:var(--text-secondary);margin:0">Inspiré des cachets japonais traditionnels, il s'imprime sur chaque anime terminé — carte, watchlist, badge de statut. Une collection qui se construit tampon après tampon.</p>
        </div>
      </div>
    </div>

    <div style="background:#14171F;color:#F1F0EC;padding:72px 24px;text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;right:8%;top:50%;transform:translateY(-50%)">
        <BrandSeal :size="140" format="svg" style="opacity:0.16;transform:rotate(12deg)" />
      </div>
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:32px;margin:0 0 12px;position:relative">Commencez votre collection aujourd'hui</h2>
      <p style="font-family:var(--font-body);font-size:15px;color:#B8B7B0;margin:0 0 26px;position:relative">Gratuit, sans publicité · Connexion GitHub ou email</p>
      <NuxtLink to="/auth/register" style="padding:15px 30px;background:var(--color-accent-primary);color:#FFFFFF;border:none;border-radius:9px;font-family:var(--font-body);font-weight:500;font-size:16px;text-decoration:none;display:inline-block;position:relative">Créer mon compte</NuxtLink>
    </div>

    <div style="background:var(--bg);max-width:1100px;margin:0 auto;padding:32px 24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid var(--border)">
      <BrandSeal :size="22" format="svg" style="flex-shrink:0;transform:rotate(6deg)" />
      <span style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--text-primary)">AnimeTrack</span>
      <span style="flex:1"></span>
      <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary)">© 2026 AnimeTrack · Fait pour les otaku qui tiennent leur carnet</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from "~/composables/useApi";

const api = useApi();
const githubLogo = new URL("../assets/images/logo-github.png", import.meta.url).href;

const stats = ref({ animes: 0, users: 0, reviews: 0 });
const topPosters = ref([
  { title: "", mon: "KR", image: null as string | null, completed: true,  bg: "#3A3F52", fg: "#EDEBE4" },
  { title: "", mon: "TG", image: null as string | null, completed: false, bg: "#DCC9E8", fg: "#3A2E44" },
  { title: "", mon: "HX", image: null as string | null, completed: false, bg: "#2E3650", fg: "#EDEBE4" },
  { title: "", mon: "KC", image: null as string | null, completed: false, bg: "#AEC3D4", fg: "#26303A" },
  { title: "", mon: "SU", image: null as string | null, completed: true,  bg: "#B8D0C4", fg: "#243A30" },
  { title: "", mon: "GP", image: null as string | null, completed: false, bg: "#7C93B0", fg: "#1B2430" },
]);

onMounted(() => {
  fetchStats();
  fetchTopPosters();
});

const fetchStats = async () => {
  try {
    const res = await api.get("/animes/stats");
    stats.value = res.data;
  } catch (e) {
    stats.value = { animes: 15000, users: 3200, reviews: 8500 };
  }
};

const fetchTopPosters = async () => {
  try {
    const res = await api.get("/animes");
    const list = Array.isArray(res.data) ? res.data.slice(0, 6) : [];
    list.forEach((a: any, i: number) => {
      const p = topPosters.value[i];
      if (!p) return;
      p.title = a.title ?? "";
      p.mon = (a.title ?? p.mon).slice(0, 2).toUpperCase();
      p.image = a.posterPath || a.imageUrl || null;
    });
  } catch (e) {
  }
};
</script>
