import { createContext, cloneElement,  Children, useState, useContext, useEffect, useCallback, useRef, createElement } from "react";

const MenuContext = createContext(null);
function Menu({children}) {
  const [on, setOn] = useState(false)
  const toggle = () => setOn(!on)
  const elRef = useRef();

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

  return <MenuContext.Provider value={{ on, toggle, elRef }}>
      {children}
  </MenuContext.Provider>
}

function useMenuButtonContext() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenuButtonContext must be used within a <Menu/>")
  }

  return context;
}

function MenuButton({ children }) {
  const context = useMenuButtonContext();
  return <button type="button" onClick={context.toggle}>{children}</button>
}

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

// eslint-disable-next-line no-unused-vars
function Example() {
  return <div className="example" style={{position: "relative"}}>
    <Menu>
      <div className="menu-click__area">
        <MenuButton>click me</MenuButton>
      </div>
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
}

function App() {
  return (
    <div className="App">
      <Example />
      <Example/>
    </div>
  );
}

export default App;
