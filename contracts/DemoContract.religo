type storage = {
  integer: int,
  message: string,
  areyouthere: bool,
  names: map (address, string)
};

/* variant defining pseudo multi-entrypoint actions */

type action =
  | Increment(int)
  | Decrement(int)
  | ChangeMessage(string)
  | AreYouThere (bool)
  | AddName ((address, string));

let add = ((s, val_): (storage, int)): storage => {...s, integer: s.integer + val_};
let sub = ((s, val_): (storage, int)): storage => {...s, integer: s.integer - val_};
let changeMessage = ((s, msg): (storage, string)): storage => {...s, message: msg};
let areYouThere = ((s, status): (storage, bool)): storage => {...s, areyouthere: status};
let addName = ((s, info): (storage, (address, string))): storage => {
  switch (Map.find_opt(info[0], s.names)) {
    | None => {...s, names: Map.add(info[0], info[1], s.names)}
    | Some (acc) =>  {...s, names: Map.update(info[0], Some (info[1]), s.names)}
  };
};

/* real entrypoint that re-routes the flow based on the action provided */

let main = ((p,storage): (action, storage)) => {
  let storage =
    switch (p) {
    | Increment (n) => add((storage, n))
    | Decrement (n) => sub((storage, n))
    | ChangeMessage (n) => changeMessage((storage, n))
    | AreYouThere (n) => areYouThere((storage, n))
    | AddName (n) => addName((storage, n))
    };
  ([]: list(operation), storage);
};
