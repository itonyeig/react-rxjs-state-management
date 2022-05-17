import React, { createContext, useContext } from "react";
import { BehaviorSubject, map, combineLatestWith } from "rxjs";

export interface Pokemon {
  id: number;
  name: string;
  type: string[];
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  power?: number;
  seleted?: boolean;
}

const rawPokemon$ = new BehaviorSubject<Pokemon[]>([]);
const pokemonWithPower$ = rawPokemon$.pipe(
  map((pokemon) =>
    pokemon.map((p) => ({
      ...p,
      power: p.hp + p.attack + p.defense + p.special_attack + p.speed,
    }))
  )
);

const selected$ = new BehaviorSubject<number[]>([]);

const pokemon$ = pokemonWithPower$.pipe(
  combineLatestWith(selected$),
  // map(([pokemon, selected]) => {
  //   pokemon.map((p) => {
  //     return {
  //       ...p,
  //       seleted: selected.includes(p.id),
  //     };
  //   });
  // }),
  // tap((data) => console.log("combineLates ", data)),
  map(([pokemon, selected]) =>
    pokemon.map((p) => ({ ...p, seleted: selected.includes(p.id) }))
  )
);

const deck$ = pokemon$.pipe(map((pokemon) => pokemon.filter((p) => p.seleted)));

fetch("/pokemon.json")
  .then((res) => res.json())
  .then((res) => rawPokemon$.next(res));

const PokemonContext = createContext({
  pokemon$,
  selected$,
  deck$,
});

export const usePokemon = () => useContext(PokemonContext);

export const PokemonProvider: React.FunctionComponent<any> = ({ children }) => (
  <PokemonContext.Provider
    value={{
      pokemon$,
      selected$,
      deck$,
    }}
  >
    {children}
  </PokemonContext.Provider>
);
