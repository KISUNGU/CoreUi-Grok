<template>
  <CRow>
    <CCol :xs="12">
      <DocsComponents href="components/nav.html" />
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Base navs</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            The base <code>.nav</code> component is built with flexbox and
            provide a strong foundation for building all types of navigation
            components. It includes some style overrides (for working with
            lists), some link padding for larger hit areas, and basic disabled
            styling.
          </p>
          <DocsExample href="components/nav.html#base-nav">
            <CNav>
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
          <p class="text-body-secondary small">
            Classes are used throughout, so your markup can be super flexible.
            Use <code>&lt;ul&gt;</code>s like above, <code>&lt;ol&gt;</code> if
            the order of your items is important, or roll your own with a
            <code>&lt;nav&gt;</code> element. Because the .nav uses display:
            flex, the nav links behave the same as nav items would, but without
            the extra markup.
          </p>
          <DocsExample href="components/nav.html#base-nav">
            <CNav as="nav">
              <CNavLink href="#" active> Active </CNavLink>
              <CNavLink href="#">Link</CNavLink>
              <CNavLink href="#">Link</CNavLink>
              <CNavLink href="#" disabled> Disabled </CNavLink>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Horizontal alignment</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            Change the horizontal alignment of your nav with
            <a href="https://coreui.io/docs/layout/grid/#horizontal-alignment">
              flexbox utilities
            </a>
            . By default, navs are left-aligned, but you can easily change them
            to center or right aligned.
          </p>
          <p class="text-body-secondary small">
            Centered with <code>.justify-content-center</code>:
          </p>
          <DocsExample href="components/nav.html#horizontal-alignment">
            <CNav class="justify-content-center">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
          <p class="text-body-secondary small">
            Right-aligned with <code>.justify-content-end</code>:
          </p>
          <DocsExample href="components/nav.html#base-nav">
            <CNav class="justify-content-end">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Vertical</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            Stack your navigation by changing the flex item direction with the{'
            '}
            <code>.flex-column</code> utility. Need to stack them on some
            viewports but not others? Use the responsive versions (e.g.,
            <code>.flex-sm-column</code>).
          </p>
          <DocsExample href="components/nav.html#vertical">
            <CNav class="flex-column">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Tabs</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            Takes the basic nav from above and adds the
            <code>variant=&#34;tabs&#34;</code> class to generate a tabbed
            interface
          </p>
          <DocsExample href="components/nav.html#tabs">
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Pills</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            Take that same HTML, but use
            <code>variant=&#34;pills&#34;</code> instead:
          </p>
          <DocsExample href="components/nav.html#pills">
            <CNav variant="pills">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Fill and justify</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            Force your <code>.nav</code>&#39;s contents to extend the full
            available width one of two modifier classes. To proportionately fill
            all available space with your <code>.nav-item</code>s, use
            <code>layout=&#34;fill&#34;</code>. Notice that all horizontal space
            is occupied, but not every nav item has the same width.
          </p>
          <DocsExample href="components/nav.html#fill-and-justify">
            <CNav variant="pills" layout="fill">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
          <p class="text-body-secondary small">
            For equal-width elements, use
            <code>layout=&#34;justified&#34;</code>. All horizontal space will
            be occupied by nav links, but unlike the .nav-fill above, every nav
            item will be the same width.
          </p>
          <DocsExample href="components/nav.html#fill-and-justify">
            <CNav variant="pills" layout="justified">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Working with flex utilities</small>
        </CCardHeader>
        <CCardBody>
          <p class="text-body-secondary small">
            If you need responsive nav variations, consider using a series of{'
            '}
            <a href="https://coreui.io/docs/utilities/flex">flexbox utilities</a
            >. While more verbose, these utilities offer greater customization
            across responsive breakpoints. In the example below, our nav will be
            stacked on the lowest breakpoint, then adapt to a horizontal layout
            that fills the available width starting from the small breakpoint.
          </p>
          <DocsExample href="components/nav.html#working-with-flex-utilities">
            <CNav
              as="nav"
              variant="pills"
              class="flex-column flex-sm-row"
            >
              <CNavLink href="#" active> Active </CNavLink>
              <CNavLink href="#">Link</CNavLink>
              <CNavLink href="#">Link</CNavLink>
              <CNavLink href="#" disabled> Disabled </CNavLink>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Tabs with dropdowns</small>
        </CCardHeader>
        <CCardBody>
          <DocsExample href="components/nav.html#tabs-with-dropdowns">
            <CNav>
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CDropdown variant="nav-item">
                <CDropdownToggle color="secondary"
                  >Dropdown button</CDropdownToggle
                >
                <CDropdownMenu>
                  <CDropdownItem href="#">Action</CDropdownItem>
                  <CDropdownItem href="#">Another action</CDropdownItem>
                  <CDropdownItem href="#">Something else here</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Vue Navs</strong> <small>Pills with dropdowns</small>
        </CCardHeader>
        <CCardBody>
          <DocsExample href="components/nav.html#pills-with-dropdowns">
            <CNav variant="pills">
              <CNavItem>
                <CNavLink href="#" active> Active </CNavLink>
              </CNavItem>
              <CDropdown variant="nav-item">
                <CDropdownToggle color="secondary"
                  >Dropdown button</CDropdownToggle
                >
                <CDropdownMenu>
                  <CDropdownItem href="#">Action</CDropdownItem>
                  <CDropdownItem href="#">Another action</CDropdownItem>
                  <CDropdownItem href="#">Something else here</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CNavItem>
                <CNavLink href="#">Link</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" disabled> Disabled </CNavLink>
              </CNavItem>
            </CNav>
          </DocsExample>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>
