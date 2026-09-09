<!-- ***** HEADER NEWS ***** -->
<div class="sec-bg3 infonews">
  <div class="container-fluid">
    <div class="row">
      <div class="col-xs-6 col-md-6 news">
      {if $loggedin}
        <div>
            <span class="badge bg-purple me-2">bun venit</span>
            <span> Vezi toate detaliile contului tău. </span>
            <span class="secnav">{include file="$template/assets/layout/secnavbar.tpl" navbar=$secondaryNavbar}</span>
        </div>
        {else}
        <div>
            <span class="badge bg-purple me-2">noutate</span>
            <span> Stocare SSD, uptime garantat și suport 24/7. </span>
            <span class="secnav"> <a class="c-yellow" href="{$WEB_ROOT}/cart.php">Vezi ofertele <i class="fas fa-arrow-circle-right"></i></a></span>
        </div>
        {/if}
      </div>
      <div class="col-xs-6 col-md-6 link">
        <div class="infonews-nav float-right">
          {if $languagechangeenabled && count($locales) > 1}
            {include file="$template/assets/layout/language.tpl"}<!-- language selector -->
          {/if}
          {include file="$template/assets/layout/notifications.tpl"} <!-- notifications -->
          <a href="{$WEB_ROOT}/cart.php?a=view" class="iconews"><i class="ico-shopping-cart f-18 w-icon"></i></a> <!-- shoping cart -->
          {if $adminMasqueradingAsClient || $adminLoggedIn}
          {include file="$template/assets/layout/adminlogin.tpl"} <!-- Admin login Access -->
          {/if} 
          {include file="$template/assets/layout/login.tpl"} <!-- login -->
          <a href="tel:+40000000000" class="iconews tabphone">+40 000 000 000</a><!-- TODO: RobixHost - actualizeaza cu numarul de telefon real -->
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ***** HEADER NAV ***** -->
<div class="menu-wrap">
  <div class="nav-menu">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-2">
          <a href="https://robixhost.ro/">
            <img class="svg logo-menu d-block" src="{$WEB_ROOT}/templates/{$template}/assets/img/logo-robixhost.webp" alt="{$companyname}">
            <img class="svg logo-menu d-none" src="{$WEB_ROOT}/templates/{$template}/assets/img/logo-robixhost.webp" alt="{$companyname}">
          </a>
        </div>
        <nav id="menu" class="col-md-10">
          <div class="navigation float-right">
            <button class="menu-toggle">
            <span class="icon"></span>
            <span class="icon"></span>
            <span class="icon"></span>
            </button>
            <ul class="main-menu nav navbar-nav navbar-right">
              <li class="menu-item">
                <a class="v-stroke m-0" href="https://robixhost.ro/">Acasă</a>
              </li>
              <li class="menu-item menu-item-has-children me-2">
                <a class="v-stroke m-0" href="#">Hosting</a>
                <div class="sub-menu menu-large bg-colorstyle">
                  <div class="service-list">
                    <div class="service">
                      <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/cloudfiber.svg" alt="Gazduire Web">
                      <div class="media-body">
                        <a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?gid=1">Găzduire Web</a>
                        <p class="seccolor">Stocare SSD, CloudLinux, cPanel sau Plesk</p>
                      </div>
                    </div>
                    <div class="service">
                      <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/reseller.svg" alt="Reseller">
                      <div class="media-body">
                        <a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?gid=2">Reseller Hosting</a>
                        <p class="seccolor">Ideal pentru agenții și găzduire multi-site</p>
                      </div>
                    </div>
                    <div class="service">
                      <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/dedicated.svg" alt="Server Dedicat">
                      <div class="media-body">
                        <a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?gid=3">Server Dedicat</a>
                        <p class="seccolor">Hardware performant, acces și control complet</p>
                      </div>
                    </div>
                    <div class="service">
                      <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/vps.svg" alt="VPS Cloud">
                      <div class="media-body">
                        <a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?gid=4">VPS Cloud</a>
                        <p class="seccolor">Resurse dedicate și performanță ridicată</p>
                      </div>
                    </div>
                    <div class="service">
                      <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/wordpress.svg" alt="WordPress Hosting">
                      <div class="media-body">
                        <a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?gid=5">Găzduire WordPress</a>
                        <p class="seccolor">Planuri optimizate special pentru WordPress</p>
                      </div>
                    </div>
                    <div class="service">
                      <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/domains.svg" alt="Domenii">
                      <div class="media-body">
                        <a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?a=add&domain=register">Domenii</a>
                        <p class="seccolor">Sute de extensii disponibile, inclusiv .ro</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- ***** Restricted Primary Navbar According "Security Hook" Into the WHMCS Root ***** -->
              {if $loggedin}
              <div id="primaryNavbar" class="desk nav navbar-nav ml-auto">
                  {include file="$template/includes/navbar.tpl" navbar=$primaryNavbar}
              </div>
              {/if}

              {if $loggedin}
              <li class="menu-item menu-item-has-children me-2" data-username="store">
                <a class="v-stroke" href="#">{$LANG.navbilling} <div class="dotted-static"><span class="main-circle"></span></div></a>
                <div class="sub-menu megamenu-list">
                  <div class="container">
                    <div class="row d-flex">
                      <div class="service-list col-md-9 bg-colorstyle">
                        <div class="row">
                          <div class="col-md-4 service">
                            <div class="media-body">
                              <div class="top-head">
                                <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/card.svg" alt="Billing">
                                <div class="menu-item c-grey mergecolor">{$LANG.billingdetails}</div> 
                              </div><hr>
                              <ul>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/clientarea.php?action=invoices">{$LANG.invoices}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/clientarea.php?action=quotes">{$LANG.quotestitle}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/clientarea.php?action=masspay&all=true">{$LANG.masspaytitle}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/account/paymentmethods">{$LANG.paymentMethods.title}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/clientarea.php?action=services">{$LANG.clientareanavservices}</a></li>
                              </ul>     
                            </div>
                          </div>
                          <div class="col-md-4 service">
                            <div class="media-body">
                              <div class="top-head">
                                <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/domainserver.svg" alt="Domains">
                                <div class="menu-item c-grey mergecolor">{$LANG.cartproductdomain}</div>
                              </div><hr>
                              <ul>
                                <li class="menu-item"><a class="menu-item mergecolor"  href="{$WEB_ROOT}/clientarea.php?action=domains">{$LANG.clientareanavdomains}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor"  href="{$WEB_ROOT}/cart.php?gid=renewals">{$LANG.domainrenewals}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor"  href="{$WEB_ROOT}/cart.php?a=add&domain=register">{$LANG.navregisterdomain}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor"  href="{$WEB_ROOT}/cart.php?a=add&domain=transfer">{$LANG.transferinadomain}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor"  href="{$WEB_ROOT}/cart.php?a=add&domain=register">{$LANG.navdomainsearch}</a></li>
                              </ul> 
                            </div>
                          </div>
                          <div class="col-md-4 service">
                            <div class="media-body">
                              <div class="top-head">
                                <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/docbox.svg" alt="Global">
                                <div class="menu-item c-grey mergecolor">{$LANG.shortcuts}</div>
                              </div><hr>
                              <ul>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/cart.php?gid=addons">{$LANG.clientareaviewaddons}</a></li>
                                <li class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/account/paymentmethods">{$LANG.paymentMethods.title}</a></li>                                
                                <li data-username="Downloads" class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/download">{$LANG.quotedownload}</a></li>
                                <li data-username="Network" class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/serverstatus.php">{$LANG.networkstatustitle}</a></li>
                                <li data-username="Home" class="menu-item"><a class="menu-item mergecolor" href="{$WEB_ROOT}/affiliates.php">{$LANG.affiliatestitle}</a></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="start-offer col-md-3">
                        <div class="inner bg-pratalight">
                          <h4 class="title my-3">{$clientsdetails.firstname} {$clientsdetails.lastname}</h4>
                          <div class="inner-content">{$clientsdetails.address1}, {$clientsdetails.city} <b>{$clientsdetails.country}</b></div>
                          <a href="{$WEB_ROOT}/clientarea.php?action=details" class="btn btn-default-yellow-fill mt-4">{$LANG.clientareanavdetails}</a>
                          <a href="{$WEB_ROOT}/supporttickets.php" class="btn btn-md btn-default-fill mt-4">{$LANG.navtickets}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              {/if}

              <li class="menu-item menu-item-has-children menu-last">
                <a class="v-stroke" href="#">Support</a>
                <div class="sub-menu megamenu">
                  <div class="container">
                    <div class="row d-flex">
                      <div class="service-list col-md-9 bg-colorstyle">
                        <div class="row">
                          <div class="col-md-4 service">
                            <div class="media-left">
                              <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/bookmark.svg" alt="Knowledgebase">
                            </div>
                            <div class="media-body">
                              <a class="menu-item mergecolor" href="{$WEB_ROOT}/knowledgebase">Bază de cunoștințe</a>
                              <p class="seccolor">Cele mai populare articole din baza de cunoștințe</p>
                            </div>
                          </div>
                          <div class="col-md-4 service">
                            <div class="media-left">
                              <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/book.svg" alt="Anunțuri">
                            </div>
                            <div class="media-body">
                              <a class="menu-item mergecolor" href="{$WEB_ROOT}/announcements">Anunțuri</a>
                              <p class="seccolor">Vezi toate anunțurile recente</p>
                            </div>
                          </div>
                          <div class="col-md-4 service">
                            <div class="media-left">
                              <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/emailopen.svg" alt="Contact">
                            </div>
                            <div class="media-body">
                              <a class="menu-item mergecolor" href="{$WEB_ROOT}/contact.php">Contact</a>
                              <p class="seccolor">Suntem aici pentru orice întrebare ai avea</p>
                            </div>
                          </div>

                          {if $loggedin}
                          <div class="col-md-4 service">
                            <div class="media-left">
                              <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/ticket.svg" alt="Open Ticket">
                            </div>
                            <div class="media-body">
                              <div>
                                <a class="menu-item mergecolor" href="{$WEB_ROOT}/submitticket.php">{$LANG.navopenticket}</a>
                              </div>
                              <p class="seccolor">{$LANG.clientareanavsupporttickets}. {$LANG.ticketsyourhistory}</p>
                            </div>
                          </div>
                          {/if}

                        </div>
                      </div>
                      <div class="start-offer col-md-3">
                        <div class="inner">
                          <h4 class="title my-3">Suport Premium</h4>
                          <div class="inner-content">
                            <span>Sună-ne:</span> <b>+40 000 000 000</b><!-- TODO: RobixHost - actualizeaza cu numarul de telefon si adresa reale -->
                          </div>
                          <a href="{$WEB_ROOT}/contact.php" class="btn btn-default-yellow-fill mt-4">Contact</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <div class="tech-box">
                <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/img/menu.svg" alt="Sidebar">
              </div>

              {if $loggedin}
              <a class="pe-0 me-0" href="{$WEB_ROOT}/logout.php"> 
                <div class="btn btn-default-yellow-fill question">
                  <span class"uppercase">{$LANG.clientareanavlogout}</span> 
                  <i class="fas fa-lock ps-1"></i> 
                </div>
              </a>
              {else}
              <a class="pe-0 me-0" href="{$WEB_ROOT}/clientarea.php"> 
                <div class="btn btn-default-yellow-fill question">
                  <span class"uppercase">{$LANG.clientlogin}</span> 
                  <i class="fas fa-lock ps-1"></i> 
                </div>
              </a>
              {/if}
              
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </div>
</div>

<!-- ***** NAV MENU MOBILE ****** -->
<div id="menu-mobile" class="menu-wrap mobile">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-xs-6 col-md-6">
        <a href="https://robixhost.ro/" class=" d-flex">
          <img class="svg logo-menu d-block" src="{$WEB_ROOT}/templates/{$template}/assets/img/logo-robixhost.webp" alt="{$companyname}">
          <img class="svg logo-menu d-none" src="{$WEB_ROOT}/templates/{$template}/assets/img/logo-robixhost.webp" alt="{$companyname}">
        </a>
      </div>
      <div class="col-xs-6 col-md-6">
        <nav class="nav-menu float-right">
          <button id="nav-toggle" class="menu-toggle">
            <span class="icon"></span>
            <span class="icon"></span>
            <span class="icon"></span>
          </button>
          <div class="tech-box float-right mt-2 pt-1">
            <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/img/menu.svg" alt="Sidebar">
          </div>
          <div class="main-menu nav navbar-nav bg-seccolorstyle">
            <div class="menu-item">
              <a href="https://robixhost.ro/" class="mergecolor">Acasă</a>
            </div>
            <div class="menu-item dropdown">
              <a href="#" class="mergecolor dropdown-toggle" data-toggle="dropdown">Hosting</a>
              <div class="dropdown-menu">
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=1">Găzduire Web</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=2">Reseller Hosting</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=3">Server Dedicat</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=4">VPS Cloud</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=5">Găzduire WordPress</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?a=add&domain=register">Domenii</a>
              </div>
            </div>
            {if $loggedin}
            <div class="menu-item dropdown menu-last">
              <a href="#" class="mergecolor dropdown-toggle" data-toggle="dropdown">{$LANG.navbilling} <div class="dotted-static"><span class="main-circle"></span></div></a>
              <div class="dropdown-menu">
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/clientarea.php?action=invoices">{$LANG.invoices}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/clientarea.php?action=quotes">{$LANG.quotestitle}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/clientarea.php?action=masspay&all=true">{$LANG.masspaytitle}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/account/paymentmethods">{$LANG.paymentMethods.title}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/clientarea.php?action=masspay&all=true">{$LANG.clientareanavservices}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/clientarea.php?action=domains">{$LANG.clientareanavdomains}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=renewals">{$LANG.domainrenewals}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?a=add&domain=register">{$LANG.navregisterdomain}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?a=add&domain=transfer">{$LANG.transferinadomain}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?a=add&domain=register">{$LANG.navdomainsearch}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/cart.php?gid=addons">{$LANG.clientareaviewaddons}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/account/paymentmethods">{$LANG.paymentMethods.title}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/download">{$LANG.quotedownload}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/serverstatus.php">{$LANG.networkstatustitle}</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/affiliates.php">{$LANG.affiliatestitle}</a>
              </div>
            </div>
            {/if}
            <div class="menu-item dropdown menu-last">
              <a href="#" class="mergecolor dropdown-toggle" data-toggle="dropdown">Support</a>
              <div class="dropdown-menu">
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/knowledgebase">Bază de cunoștințe</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/announcements">Anunțuri</a>
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/contact.php">Contact</a>
                {if $loggedin}
                <a class="dropdown-item menu-item" href="{$WEB_ROOT}/submitticket.php">{$LANG.navopenticket}</a>
                {/if}
              </div>
            </div>
            <div class="float-left w-100 mt-3 f-18">
              <p class="c-grey-light seccolor"><small>Email: office@robixhost.ro</small> </p>
            </div>
            <div>
              <a href="login"><div class="btn btn-default-yellow-fill mt-3">CONTUL MEU</div></a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
</div>

<!-- ***** OFFCANVAS Sidebar ****** -->
<div class="offcanvas offcanvas-start offcanvas-box bg-colorstyle" tabindex="-1" id="offcanvasWithBackdrop" aria-labelledby="offcanvasWithBackdropLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title mergecolor f-22" id="offcanvasWithBackdropLabel">Serviciile Noastre</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <div class="row mb-4">
      <h6 class="mergecolor mb-4 f-16 ml-20">Găzduire &amp; Servicii</h6>
      <div class="col-md-6">
        <a href="{$WEB_ROOT}/cart.php?gid=1">
          <div class="card mb-4 br-12 upping cursor-p p-relative noshadow border-0 bg-white bg-seccolorstyle">
            <div class="row g-0 d-flex">
              <div class="col-md-4">
                <img class="svg img-fluid rounded-start" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/cloudfiber.svg" alt="Gazduire Web">
              </div>
              <div class="col-md-8">
                <div class="card-body pl-0">
                  <h6 class="card-title c-black mergecolor f-16">Găzduire Web</h6>
                  <p class="card-text c-black seccolor f-16 mb-0"><small>Stocare SSD, CloudLinux, cPanel</small></p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
      <div class="col-md-6">
        <a href="{$WEB_ROOT}/cart.php?a=add&domain=register">
          <div class="card mb-4 br-12 upping cursor-p p-relative noshadow border-0 bg-white bg-seccolorstyle">
            <div class="row g-0 d-flex">
              <div class="col-md-4">
                <img class="svg img-fluid rounded-start" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/domains.svg" alt="Domenii">
              </div>
              <div class="col-md-8">
                <div class="card-body pl-0">
                  <h6 class="card-title c-black mergecolor f-16">Domenii</h6>
                  <p class="card-text c-black seccolor f-16 mb-0"><small>Sute de extensii disponibile</small></p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
      <div class="col-md-6">
        <a href="{$WEB_ROOT}/cart.php?gid=3">
          <div class="card mb-4 br-12 upping cursor-p p-relative noshadow border-0 bg-white bg-seccolorstyle">
            <div class="row g-0 d-flex">
              <div class="col-md-4">
                <img class="svg img-fluid rounded-start" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/dedicated.svg" alt="Server Dedicat">
              </div>
              <div class="col-md-8">
                <div class="card-body pl-0">
                  <h6 class="card-title c-black mergecolor f-16">Server Dedicat</h6>
                  <p class="card-text c-black seccolor f-16 mb-0"><small>Hardware performant, control complet</small></p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
      <div class="col-md-6">
        <a href="{$WEB_ROOT}/cart.php?gid=4">
          <div class="card mb-4 br-12 upping cursor-p p-relative noshadow border-0 bg-white bg-seccolorstyle">
            <div class="row g-0 d-flex">
              <div class="col-md-4">
                <img class="svg img-fluid rounded-start" src="{$WEB_ROOT}/templates/{$template}/assets/fonts/svg/vps.svg" alt="VPS Cloud">
              </div>
              <div class="col-md-8">
                <div class="card-body pl-0">
                  <h6 class="card-title c-black mergecolor f-16">VPS Cloud</h6>
                  <p class="card-text c-black seccolor f-16 mb-0"><small>Resurse dedicate, performanță ridicată</small></p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
    <div class="row mb-4">
      <h6 class="mergecolor f-16 ml-20">Sisteme de Operare &amp; Panouri</h6>
      <p class="seccolor ml-20"><small>Compatibilitate cu cele mai populare sisteme și aplicații.</small></p>
      <div class="os br-12 upping cursor-p noshadow bg-seccolorstyle">
        <a href="#">
          <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/apps/centos.svg" alt="Centos">
          <p class="mb-0 seccolor">Centos</p>
        </a>
      </div>
      <div class="os br-12 upping cursor-p noshadow bg-seccolorstyle">
        <a href="#">
          <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/apps/debian.svg" alt="Debian">
          <p class="mb-0 seccolor">Debian</p>
        </a>
      </div>
      <div class="os br-12 upping cursor-p noshadow bg-seccolorstyle">
        <a href="#">
          <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/apps/docker.svg" alt="Docker">
          <p class="mb-0 seccolor">Docker</p>
        </a>
      </div>
      <div class="os br-12 upping cursor-p noshadow bg-seccolorstyle">
        <a href="#">
          <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/apps/cpanel.svg" alt="cPanel">
          <p class="mb-0 seccolor">cPanel</p>
        </a>
      </div>
      <div class="os br-12 upping cursor-p noshadow bg-seccolorstyle">
        <a href="#">
          <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/apps/gitlab.svg" alt="Gitlab">
          <p class="mb-0 seccolor">Gitlab</p>
        </a>
      </div>
      <div class="os br-12 upping cursor-p noshadow bg-seccolorstyle">
        <a href="#">
          <img class="svg" src="{$WEB_ROOT}/templates/{$template}/assets/apps/windows.svg" alt="Windows">
          <p class="mb-0 seccolor">Windows</p>
        </a>
      </div>
    </div>
  </div>
</div>
<div class="backdrop-start offcanvas-backdrop fade" data-bs-dismiss="offcanvas"></div>
