# A Contrived [Menu Button](https://reach.tech/menu-button)

> See [demo on CodeSandbox](https://codesandbox.io/s/menu-button-demo-9o0f8)

I tried to use my knowledge from [Epic React](https://epicreact.dev) to create a Menu Button like https://reach.tech/menu-button

The most important thing I learned is that building a library isn't the most simplest thing.
I suppose the first thing to be done is to sketch out how you want the API to be used. In this case:

```js
function Example() {
  return (
    <div className="example" style={{ position: "relative" }}>
      <Menu>
        <MenuButton>click me</MenuButton>
        <MenuList>
          <MenuItem>
            <p>menu item 1</p>
          </MenuItem>
          <MenuItem as="h1">
            <p>menu item 2</p>
          </MenuItem>
          <MenuItem>
            <input type="text" placeholder="type"/>
          </MenuItem>
          <MenuLink href="./">link</MenuLink>
        </MenuList>
      </Menu>
    </div>
  )
}
```

I enjoy the use of [compound components](https://kentcdodds.com/blog/compound-components-with-react-hooks) and how they make the API [composable](https://www.youtube.com/watch?v=nUzLlHFVXx0). Now I can do something like:

```js
function MenuButton({ children }) {
  const context = useMenuButtonContext();
  return <button type="button" onClick={context.toggle}>{children}</button>
}
```

with the `useMenuButtonContext()`:

```js
function useMenuButtonContext() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenuButtonContext must be used within a <Menu/>")
  }

  return context;
}
```

and the `MenuContext` and `Menu`
```js
const MenuContext = createContext(null);
function Menu({children}) {
  const { on, elRef , toggle} = useClickOutside(false)

  return <MenuContext.Provider value={{ on, toggle, elRef }}>
      {children}
  </MenuContext.Provider>
}
```

The `useClickOutside` allows us to click outside the menu to dismiss it. It looks like:

```js
function useClickOutside(initialState) {
  const [on, setOn] = useState(initialState)
  const elRef = useRef();
  const toggle = () => setOn(!on)

  const onDocumentClick = useCallback(
    (el) => {
      const controlledElement = elRef.current;

      if (controlledElement) {
        const isKeydownEvent = el.type === 'keydown';
        const isClickEvent = el.type === 'click';

        if (isClickEvent) {
          const isInside = controlledElement.contains(el.target);
          if (!isInside) {
            return setOn(false);
          }
        }

        if (isKeydownEvent) {
          const isEscapeKey = isKeydownEvent && el.keyCode === 27 && true;
          if (isEscapeKey) {
            return setOn(false);
          }
        }
      }
    },
    [setOn]
  );


  useEffect(() => {
    // 1. Only attach the event handler to document when `on` is true
    if (on) {
      document.addEventListener('click', onDocumentClick);
      document.addEventListener('keydown', onDocumentClick);
    }

    // 2. Remove the document event handler when the component unmounts
    return () => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onDocumentClick);
    };
  }, [on, onDocumentClick])

  return {on, elRef, toggle}
}
```

The `MenuList` and `MenuItem`, and `MenuLink` also take the shape:

```js
function MenuList({ children }) {
  const context = useMenuButtonContext();

  return context.on ? <div className="menu-items" ref={context.elRef}>
    {Children.map(children, child => {
      return cloneElement(child, {
        className: "menu-item"
      })
    })}
  </div> : null
}

function MenuItem({as = "div", children, ...props}) {
  return createElement(as, { ...props }, children);
}

function MenuLink({href, children, ...props}) {
  return createElement("a", { href, ...props }, children);
}
```

We listen for the `click` and `keydown` event on the `document` when the menu is open, then
close it if the conditions in `onDocumentClick` are met.

See how we are gradually composing logic yet separating them in a reusable way? [React](https://reactjs.org/)
is love.


### Final Note
This is my first time building something like this. Thanks to Epic React from [Kent C. Dodds](https://twitter.com/kentcdodds/),
[Ryan Florence](https://twitter.com/ryanflorence), [Michael Jackson](https://twitter.com/mjackson),
[Wes Bos](https://twitter.com/wesbos), [Dan Abramov](https://twitter.com/dan_abramov),
[Andrew Clark](https://twitter.com/acdlite), and everyone on the React team and in the React Community.