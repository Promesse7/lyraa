/* eslint-disable no-console */
// Seed data for Lyraa Live v1.0. All artists, tracks, lyrics and users are
// invented samples (per the design handoff note) — none refer to real people.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const g = {
  accent: "radial-gradient(circle at 30% 30%, #f6a06b, #8c491a)",
  accentAvatar: "radial-gradient(circle at 30% 30%, #ffc6a5, #8c491a)",
  sageA: "radial-gradient(circle at 70% 30%, #aebf92, #3d472b)",
  sageB: "radial-gradient(circle at 70% 70%, #ccdbb2, #56633f)",
  neutral: "radial-gradient(circle at 30% 70%, #c0b6a5, #474238)",
};

async function main() {
  console.log("Seeding Lyraa…");
  // wipe (dev convenience — seed is idempotent by full reset)
  await db.$transaction([
    db.cardComment.deleteMany(),
    db.cardLike.deleteMany(),
    db.lyricCard.deleteMany(),
    db.lineComment.deleteMany(),
    db.lineLike.deleteMany(),
    db.annotationUpvote.deleteMany(),
    db.annotation.deleteMany(),
    db.lyricLine.deleteMany(),
    db.lyricSection.deleteMany(),
    db.follow.deleteMany(),
    db.track.deleteMany(),
    db.artist.deleteMany(),
    db.submission.deleteMany(),
    db.lyricRequest.deleteMany(),
    db.apiKey.deleteMany(),
    db.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash("lyraa123!", 12);

  const [fan, ineza, editor, admin, kagaboUser, ntareUser] = await Promise.all([
    db.user.create({
      data: {
        username: "keza.amahoro", name: "Keza Amahoro",
        email: "fan@lyraa.rw", passwordHash, role: "FAN",
        points: 120, avatarTone: "sage",
      },
    }),
    db.user.create({
      data: {
        username: "ineza.k", name: "Ineza Kaliza",
        email: "ineza@lyraa.rw", passwordHash, role: "FAN",
        points: 260, avatarTone: "sage",
      },
    }),
    db.user.create({
      data: {
        username: "umuhanga.w", name: "Umuhanga Uwase",
        email: "editor@lyraa.rw", passwordHash, role: "EDITOR",
        points: 980, avatarTone: "neutral",
      },
    }),
    db.user.create({
      data: {
        username: "admin", name: "Lyraa Admin",
        email: "admin@lyraa.rw", passwordHash, role: "ADMIN",
        avatarTone: "neutral",
      },
    }),
    db.user.create({
      data: {
        username: "kagabo.prince", name: "Kagabo Prince",
        email: "artist@lyraa.rw", passwordHash, role: "ARTIST",
        avatarTone: "accent",
      },
    }),
    db.user.create({
      data: {
        username: "mc.ntare", name: "MC Ntare",
        email: "ntare@lyraa.rw", passwordHash, role: "ARTIST",
        avatarTone: "accent",
      },
    }),
  ]);

  const kagabo = await db.artist.create({
    data: {
      slug: "kagabo-prince", name: "Kagabo Prince", verified: true,
      genres: "Gakondo / R&B", location: "Kigali",
      avatarGradient: g.accentAvatar,
      bio: "Gakondo soul with modern R&B — songs about inheritance, love and home.",
      pinnedInterpretation:
        "\"The herds in 'Amashyo' are inheritance — love as the wealth you pass down.\"",
      pinnedInterpretationBy: "fan @ineza.k, pinned by the artist",
      followersCount: 18432, userId: kagaboUser.id,
    },
  });
  const umwali = await db.artist.create({
    data: {
      slug: "umwali-b", name: "Umwali B", verified: true,
      genres: "Afrobeats", location: "Kigali",
      avatarGradient: g.accent, followersCount: 9210,
    },
  });
  const keza = await db.artist.create({
    data: {
      slug: "keza-aline", name: "Keza Aline", verified: false,
      genres: "Gospel", location: "Huye",
      avatarGradient: g.sageA, followersCount: 4102,
    },
  });
  const ntare = await db.artist.create({
    data: {
      slug: "mc-ntare", name: "MC Ntare", verified: true,
      genres: "Kinyatrap", location: "Kigali",
      avatarGradient: g.neutral, followersCount: 12877, userId: ntareUser.id,
    },
  });
  const cyusa = await db.artist.create({
    data: {
      slug: "cyusa-trio", name: "Cyusa Trio", verified: false,
      genres: "Gakondo", location: "Musanze",
      avatarGradient: g.sageB, followersCount: 1560,
    },
  });

  // ——— Amashyo y'Umutima (the reader demo track, screens 04–06) ———
  const amashyo = await db.track.create({
    data: {
      slug: "amashyo-y-umutima", title: "Amashyo y'Umutima",
      artistId: kagabo.id, genre: "Gakondo", releaseYear: 2024,
      coverGradient: g.accent, verification: "ARTIST_VERIFIED",
      producers: "Igisirimba Beats", trendingScore: 95,
      youtubeUrl: "https://youtube.com/watch?v=lyraa-demo",
    },
  });
  const v1 = await db.lyricSection.create({
    data: { trackId: amashyo.id, label: "Verse 1", order: 1 },
  });
  const chorus = await db.lyricSection.create({
    data: { trackId: amashyo.id, label: "Chorus", order: 2 },
  });
  const amashyoLines = await Promise.all([
    db.lyricLine.create({
      data: {
        trackId: amashyo.id, sectionId: v1.id, order: 1,
        textRw: "Nagusanze mu gitondo, izuba riva i Burasirazuba",
        textEn: "I found you in the morning, as the sun rose in the East",
        textFr: "Je t'ai trouvée au matin, le soleil se levant à l'Est",
        likesCount: 58,
      },
    }),
    db.lyricLine.create({
      data: {
        trackId: amashyo.id, sectionId: v1.id, order: 2,
        textRw: "Wari wambaye urugori, ubwiza bw'umwamikazi",
        textEn: "You wore the crown of honor, the beauty of a queen",
        textFr: "Tu portais la couronne d'honneur, la beauté d'une reine",
        likesCount: 131,
      },
    }),
    db.lyricLine.create({
      data: {
        trackId: amashyo.id, sectionId: v1.id, order: 3,
        textRw: "Umutima wanjye waguye mu mashyo yawe",
        textEn: "My heart fell among your herds — a wealth of love",
        textFr: "Mon cœur est tombé parmi tes troupeaux — une richesse d'amour",
        likesCount: 214,
      },
    }),
    db.lyricLine.create({
      data: {
        trackId: amashyo.id, sectionId: v1.id, order: 4,
        textRw: "Sinzagusiga, ndakurahiye ku mugani wa sogokuru",
        textEn: "I will never leave you — I swear it on my grandfather's proverb",
        textFr: "Je ne te quitterai jamais — je le jure sur le proverbe de mon grand-père",
        likesCount: 77,
      },
    }),
    db.lyricLine.create({
      data: {
        trackId: amashyo.id, sectionId: chorus.id, order: 5,
        textRw: "Amashyo y'umutima, ni wowe uyaragiye",
        textEn: "The herds of my heart — you are their keeper",
        textFr: "Les troupeaux de mon cœur — c'est toi qui les gardes",
        likesCount: 102,
      },
    }),
    db.lyricLine.create({
      data: {
        trackId: amashyo.id, sectionId: chorus.id, order: 6,
        textRw: "Ndaguha byose, sinzigera nkuvaho",
        textEn: "I give you everything, I will never leave your side",
        textFr: "Je te donne tout, je ne m'éloignerai jamais",
        likesCount: 64,
      },
    }),
  ]);

  await db.annotation.create({
    data: {
      trackId: amashyo.id, lineId: amashyoLines[1].id,
      phrase: "urugori", kind: "CULTURAL_TERM",
      literal: "A traditional headband crown worn by married Rwandan women.",
      poetic:
        "In this verse it stands for dignity and honored womanhood — the singer sees his beloved as royalty, someone worthy of lifelong respect.",
      culturalContext:
        "The urugori is tied during traditional ceremonies and appears widely in Gakondo poetry (ibisigo) as a symbol of a woman's standing in the household.",
      artistNote:
        "I wrote this line for my mother. She wore hers with so much pride.",
      artistNoteBy: "Kagabo Prince",
      annotatedBy: "umuhanzi_w", upvotes: 48,
    },
  });
  await db.annotation.create({
    data: {
      trackId: amashyo.id, lineId: amashyoLines[2].id,
      phrase: "mashyo", kind: "CULTURAL_TERM",
      literal: "Herds of cattle (amashyo).",
      poetic:
        "Cattle are the classical measure of Rwandan wealth — a heart falling 'among your herds' makes love itself the riches.",
      culturalContext:
        "Cattle run through Kinyarwanda blessing and poetry — 'Gira inka' (may you have cows) is a traditional wish of prosperity.",
      annotatedBy: "inyange_ke", upvotes: 32,
    },
  });
  await db.annotation.create({
    data: {
      trackId: amashyo.id, lineId: amashyoLines[3].id,
      phrase: "mugani", kind: "PROVERB",
      literal: "A proverb or saying (umugani).",
      poetic:
        "Swearing on a grandfather's proverb binds the promise to ancestral wisdom — it cannot be broken lightly.",
      culturalContext:
        "Imigani (proverbs) carry moral authority in Rwandan oral tradition; invoking an elder's proverb is invoking their standing.",
      annotatedBy: "umuhanzi_w", upvotes: 21,
    },
  });

  // line interpretations on the hero line
  await db.lineComment.createMany({
    data: [
      {
        lineId: amashyoLines[2].id, userId: ineza.id,
        body: "The cattle metaphor is everything — wealth that walks beside you.",
      },
      {
        lineId: amashyoLines[2].id, userId: fan.id,
        body: "I hear this as love that grows the way a herd grows — slowly, then all at once.",
      },
    ],
  });

  // ——— rest of the catalogue ———
  const inzozi = await db.track.create({
    data: {
      slug: "inzozi-za-kigali", title: "Inzozi za Kigali",
      artistId: umwali.id, genre: "Afrobeats", releaseYear: 2025,
      coverGradient: g.accent, verification: "ARTIST_VERIFIED",
      trendingScore: 100,
    },
  });
  const inzoziChorus = await db.lyricSection.create({
    data: { trackId: inzozi.id, label: "Chorus", order: 1 },
  });
  await db.lyricLine.createMany({
    data: [
      {
        trackId: inzozi.id, sectionId: inzoziChorus.id, order: 1,
        textRw: "Inzozi za Kigali ziranyereka inzira",
        textEn: "The dreams of Kigali show me the way",
        textFr: "Les rêves de Kigali me montrent le chemin",
        likesCount: 88,
      },
      {
        trackId: inzozi.id, sectionId: inzoziChorus.id, order: 2,
        textRw: "Amatara y'umujyi aramurika nk'inyenyeri",
        textEn: "The city lights shine like stars",
        textFr: "Les lumières de la ville brillent comme des étoiles",
        likesCount: 41,
      },
    ],
  });

  const ntabwo = await db.track.create({
    data: {
      slug: "ntabwo-nzibagirwa", title: "Ntabwo Nzibagirwa",
      artistId: keza.id, genre: "Gospel", releaseYear: 2024,
      coverGradient: g.sageA, verification: "COMMUNITY",
      trendingScore: 90,
    },
  });
  const ntabwoV1 = await db.lyricSection.create({
    data: { trackId: ntabwo.id, label: "Verse 1", order: 1 },
  });
  const ntabwoV2 = await db.lyricSection.create({
    data: { trackId: ntabwo.id, label: "Verse 2", order: 2 },
  });
  await db.lyricLine.createMany({
    data: [
      {
        trackId: ntabwo.id, sectionId: ntabwoV1.id, order: 1,
        textRw: "Uwiteka yanyibutse mu ijoro ryinshi",
        textEn: "The Lord remembered me in the deep of night",
        textFr: "Le Seigneur s'est souvenu de moi au cœur de la nuit",
        likesCount: 33,
      },
      {
        trackId: ntabwo.id, sectionId: ntabwoV2.id, order: 2,
        textRw: "Nsigaye nifitiye inzozi zanjye gusa",
        textEn: "I am left with only my dreams",
        textFr: "Il ne me reste que mes rêves",
        likesCount: 27,
      },
      {
        trackId: ntabwo.id, sectionId: ntabwoV2.id, order: 3,
        textRw: "Ariko ntabwo nzibagirwa n'Imana",
        textEn: "But I will not be forgotten by God",
        textFr: "Mais je ne serai pas oublié de Dieu",
        likesCount: 45,
      },
    ],
  });

  const barafite = await db.track.create({
    data: {
      slug: "barafite-ubwoba", title: "Barafite Ubwoba",
      artistId: ntare.id, genre: "Kinyatrap", releaseYear: 2025,
      coverGradient: g.neutral, verification: "ARTIST_VERIFIED",
      trendingScore: 85,
    },
  });
  const barafiteHook = await db.lyricSection.create({
    data: { trackId: barafite.id, label: "Hook", order: 1 },
  });
  await db.lyricLine.createMany({
    data: [
      {
        trackId: barafite.id, sectionId: barafiteHook.id, order: 1,
        textRw: "Barafite ubwoba, twebwe dufite intego",
        textEn: "They have fear, we have purpose",
        textFr: "Ils ont la peur, nous avons un but",
        likesCount: 156,
      },
      {
        trackId: barafite.id, sectionId: barafiteHook.id, order: 2,
        textRw: "Tuva hasi tujya hejuru nta muntu udahagarara",
        textEn: "We rise from the bottom to the top, no one stands still",
        textFr: "On monte du bas vers le haut, personne ne reste immobile",
        likesCount: 72,
      },
    ],
  });

  const inzoziNziza = await db.track.create({
    data: {
      slug: "inzozi-nziza", title: "Inzozi Nziza",
      artistId: cyusa.id, genre: "Gakondo", releaseYear: 1998,
      coverGradient: g.sageB, verification: "EDITOR_APPROVED",
      trendingScore: 40,
    },
  });
  const nzizaS = await db.lyricSection.create({
    data: { trackId: inzoziNziza.id, label: "Intro", order: 1 },
  });
  await db.lyricLine.createMany({
    data: [
      {
        trackId: inzoziNziza.id, sectionId: nzizaS.id, order: 1,
        textRw: "Inzozi nziza z'abasokuruza bacu",
        textEn: "The good dreams of our ancestors",
        textFr: "Les beaux rêves de nos ancêtres",
        likesCount: 19,
      },
    ],
  });

  const impundu = await db.track.create({
    data: {
      slug: "impundu", title: "Impundu",
      artistId: kagabo.id, genre: "Gakondo", releaseYear: 2023,
      coverGradient: g.sageA, verification: "EDITOR_APPROVED",
      trendingScore: 60,
    },
  });
  const impunduChorus = await db.lyricSection.create({
    data: { trackId: impundu.id, label: "Chorus", order: 1 },
  });
  await db.lyricLine.createMany({
    data: [
      {
        trackId: impundu.id, sectionId: impunduChorus.id, order: 1,
        textRw: "Impundu zavuze mu gitondo",
        textEn: "Cries of joy rang out in the morning",
        textFr: "Les youyous ont retenti au matin",
        likesCount: 51,
      },
      {
        trackId: impundu.id, sectionId: impunduChorus.id, order: 2,
        textRw: "Umunsi mwiza waratangiye",
        textEn: "A beautiful day has begun",
        textFr: "Une belle journée a commencé",
        likesCount: 28,
      },
    ],
  });

  // ——— feed (screen 07) ———
  await db.lyricCard.create({
    data: {
      userId: ineza.id, trackId: amashyo.id,
      linesText: "Umutima wanjye waguye mu mashyo yawe",
      translation: "My heart fell among your herds",
      theme: "terracotta", aspect: "post",
      caption: "This line lives in my head rent-free 🕊️ the cattle metaphor is everything",
      likesCount: 482, commentsCount: 57,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  });
  const ntareCard = await db.lyricCard.create({
    data: {
      userId: ntareUser.id, trackId: barafite.id,
      linesText: "Barafite ubwoba, twebwe dufite intego",
      translation: "They have fear, we have purpose",
      theme: "sage", aspect: "post",
      caption: "The real story behind this hook — I recorded it the night before my first show.",
      isArtistNote: true,
      likesCount: 1204, commentsCount: 203,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
    },
  });
  await db.cardComment.createMany({
    data: [
      { cardId: ntareCard.id, userId: fan.id, body: "Legendary. We need the documentary 🎬" },
      { cardId: ntareCard.id, userId: ineza.id, body: "This hook carried the whole summer." },
    ],
  });

  // follows
  await db.follow.createMany({
    data: [
      { userId: fan.id, artistId: kagabo.id },
      { userId: ineza.id, artistId: kagabo.id },
      { userId: fan.id, artistId: ntare.id },
    ],
  });

  // moderation queue demo (screen /review)
  await db.submission.create({
    data: {
      userId: fan.id, title: "Umurava", artistName: "Bella Iradukunda",
      genre: "Afrobeats", language: "rw",
      body: "[Verse 1]\nUmurava wawe uramfasha guhagarara\nNta mvura izambuza kugera aho njya\n\n[Chorus]\nUmurava, umurava\nNi wo mbaraga zanjye",
    },
  });
  await db.submission.create({
    data: {
      userId: ineza.id, title: "Agaciro", artistName: "Cyusa Trio",
      genre: "Gakondo", language: "rw",
      body: "[Intro]\nAgaciro k'umuntu kava mu mutima\n\n[Verse 1]\nNtawe ugura agaciro ku isoko",
    },
  });

  // demo API key (documented in README)
  await db.apiKey.create({
    data: {
      key: "lyraa_demo_key_123", label: "Demo key",
      ownerId: admin.id, rpm: 100,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
