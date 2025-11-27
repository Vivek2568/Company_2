import React from 'react';
import { Link } from 'react-router-dom';

const HomeHero = () => {
  const imageCollage = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBA_MoTCHgXplOzcKsyueiAbGx4ZxO9DOOnVmvklir5boSRx2Vbe0jTqXQZHgIh1UDZEXeFV0BDnifihT1UFvQ-m8TvhDy7qPrOm4ztIdrVzJNCp1_QyrxTgQ46Frv_mElrV-Dfq4RTkIWSuH1cRpjkJl5nU8CirjkMyz5HboKPDo1L9dbqbPm3hvSPgGjMHizaxwxsEyz4iYbxE94owxzda4S7iV6VaIBTUgq73eNwZV4XJqZyFIzXHZ2zace8kajxWdW0TPlkbRI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwDJ2Togzcviw7R2gTUC0QE1SYw2qEAq-L2YyOXTUPoiuvSbMb1GZcPlV1PeJ1jo9zOgkm3yrDQ4hxR-XS90vWuIVbgWWcCzmxO5yUbSTNyHE370Ds39g-TJf8WHvdSxhFxvcw5lSKaseft0ufVLVnPYbjLOfJhkmo0Cj8DHJrYZKLqeJsFDbxLl2cc8yT2FFwAo1PpRd5grm1bES4fAv0t4gs9GDFFjwens58H1uvoGoQDmwNR2a1tl0eDWmTNAoE7FvtBI6agWY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBNoyKCpgPm60npITve2zaPAnIcQDeWx4x91RMwII6GxBK4suGC6-qlxfpz4MIK3_J6_YqiiTS2fgCToOAfgWC7o_RxcN9CYHMiJdXNWXit36RgUQ2mt6qCBZSAn2tD7PumUjI74iBpQ5J7G7Quc9lQBOVZLtVPhGxzymfx-kN62_pi5Yrw79iXQozT2MHZ-ABhLeRrQxsPk24-Uu0Qn0XfYTJvI74T93T-2EVitoShGsYiYoctMKT0ZtuTKxZjNrz3Wio8t7MklJo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDY-vWGa9bp5_YOrpss_TufY17fvDyLCosHLK0hDVbqOVagg97wal0gM1tP-0ZWRuSNfKcRBgYanf4yfEQkVsGda5A63ZMiCEW-m9w8h_kuV53RrWWYmehKecceNbtjp6gR7YxzwJinqKcUaPPK8MECu5HgcCD4v3d_41WKmAcTpn7iqCfGypN7C3sHXJP8wkS6fQIKkt45vtIO1_DHdB_4UtPriqCyFlPxkXtjAgxKFFzbFjsXiaJDpJyVrcoM8EHOreS-n56zXwY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAEem1mJMH3Yg0I1ci3RIHc5uSITPZWLJfgUsVNDdE-Fb7stYcOTH8H2LfNYupSL9vqg2lX2CIFv4AkC2MtBeYAx9jEkx_RYmAdifWxBrQjLJeVovA1nr2O1xQTBgC5ULJUoDmvlsfJzFq9j3D16tdH8CspiCHmgWq5Ud2Zo-7MJyfXBz6noNo-JzEntrsTOvkkGqYPNueM8s5TRcdLsFFEb9oZzHXRUZok1a-s0_i_P_SpQOycMdsON-v2Dv9xfdLUyVFJW6q003s',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDobL11HrXvtDy2o4BNPLbt4fQBwCAnk_rKfrjkGXS7xuO-xSWokapE-APZi-r0fjTXdwn3YPBlrP_HjQQ4FJAB-O4cS5-7dDfw9_j73aZv6E457zVSE4ZN10d-N6cOh9lHjYkjqV57vlcShM9k5tgMpDoa2ZCeNefGirgDx7JhRrMpHDf1o2Mr99dTzT-HcxGQZNGrJSEmWAnVyi0XuFb8N4RaGMSYqhy_Q-GhhQTMr6Ntdjwasi6u9tLFFxHfhgdwgmfLZhaAWmI',
  ];

  const collageConfig = [
    { col: 'col-span-2', row: 'row-span-2', opacity: '' },
    { col: 'col-span-2', row: 'row-start-3', opacity: 'opacity-70' },
    { col: 'col-span-2 col-start-3', row: 'row-span-3', opacity: 'opacity-80' },
    { col: '', row: 'row-span-2 row-start-3', opacity: 'opacity-90' },
    { col: 'col-start-2', row: 'row-start-4', opacity: 'opacity-60' },
    { col: 'col-start-4', row: 'row-start-4', opacity: 'opacity-50' },
  ];

  return (
    <section className="relative flex h-auto min-h-[75vh] w-full flex-col">
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Left Side */}
        <div className="flex flex-col items-center justify-center gap-8 p-8 py-16 text-center lg:p-12 lg:text-left">
          <div className="flex max-w-lg flex-col gap-6">
            <h1 className="text-5xl font-black leading-tight tracking-tighter text-[#0e141b] dark:text-slate-50 md:text-6xl">
              Share Your Story With the World
            </h1>
            <h2 className="text-base font-normal leading-normal text-[#4d7399] dark:text-slate-400 md:text-lg">
              Write, record, and express ideas that connect people.
            </h2>
          </div>
          <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/create-post"
              className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FFD84D] px-6 text-base font-bold leading-normal tracking-[0.015em] text-slate-900 transition-transform hover:scale-105"
            >
              Get Started
            </Link>
            <a
              href="#latest"
              className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-transparent px-6 text-base font-bold leading-normal tracking-[0.015em] text-[#0e141b] transition-colors hover:bg-slate-200/50 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-800/50"
            >
              Explore Content
            </a>
          </div>
        </div>

        {/* Right Side Collage */}
        <div className="relative hidden h-full min-h-[400px] items-center justify-center p-8 lg:flex">
          <div className="grid h-full w-full max-w-2xl grid-cols-4 grid-rows-4 gap-4">
            {imageCollage.map((image, idx) => (
              <div
                key={idx}
                className={`${collageConfig[idx].col} ${collageConfig[idx].row} ${collageConfig[idx].opacity} transform rounded-[1.5rem] bg-cover bg-center transition-all duration-300 ease-in-out hover:z-10 hover:scale-105 hover:opacity-100`}
                style={{ backgroundImage: `url('${image}')` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
