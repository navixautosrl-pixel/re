<!-- Slider Section -->
<div class="main-container slider">
    <div class="silder-container">
        <div class="carousel header-main-slider">
            <!-- 1 Slider -->
            <div class="carousel-cell overlay">
                <div class="slider-content">
                    <div class="container">
                        <img class="svg custom-element-right" src="{$WEB_ROOT}/templates/{$template}/assets/patterns/domainmanage.svg" alt="Domains">
                        <div class="col-sm-12 col-md-6 px-0">
                            <h1 data-aos="fade-up" data-aos-duration="800">{$LANG.findyourdomain}</h1>
                            <p data-aos="fade-up" data-aos-duration="1200">{$LANG.domainintrotext}</p>
                            <form class="domains-search" method="post" action="domainchecker.php">
                                <input type="text" class="inputdomainsearch special-input" name="domain" placeholder="{$LANG.exampledomain}" autocapitalize="none" />
                                <span class="ds-content">
                                    <input type="submit" class="btn btn-default-yellow-fill border-end-0 search initial-transform" value="Search">
                                    <button data-toggle="tooltip" data-placement="bottom" title="{$LANG.domainstransfer}" type="submit" name="transfer" class="btn btn-default-fill border-start-0 initial-transform ml-4" value="{$LANG.domainstransfer}"><i class="fa-solid fa-repeat"></i></button>
                                </span>
                            </form>
                            <div class="special-note"><span class="text">Caută domeniul potrivit pentru afacerea ta</span></div><!-- TODO: RobixHost - preturile domeniilor se configureaza in WHMCS, nu aici -->
                        </div>
                    </div>
                </div>
                <div class="silder-video">
                    <div class="cover-wrapper">
                        <video class="cover-video" autoplay loop muted>
                            <source src="{$WEB_ROOT}/templates/{$template}/assets/videos/planet.mp4" type="video/mp4">
                        </video>
                    </div>
                </div>
            </div>
            <!-- 2 Slider -->
            <div class="carousel-cell overlay">
                <div class="slider-content">
                    <div class="container ">
                        <img class="svg custom-element-right" src="{$WEB_ROOT}/templates/{$template}/assets/patterns/api.svg" alt="Dedicated Server">
                        <div class="col-sm-12 col-md-6 px-0">
                            <h1 data-aos="fade-up" data-aos-duration="800">Server Dedicat <br>cu <br> <span id="typed1"></span></h1>
                            <p class="text-break" data-aos="fade-up" data-aos-duration="1200">{$LANG.cartnameserversdesc}</p>
                            <a href="{$WEB_ROOT}/cart.php?gid=3" class="btn btn-default-yellow-fill me-2">{$LANG.ordernowbutton} <i class="fas fa-cart-plus ps-1 f-15"></i></a>
                            <a href="{$WEB_ROOT}/cart.php?gid=3" class="btn btn-default-pink-fill">{$LANG.learnmore}</a>
                        </div>
                    </div>
                </div>
                <div class="carousel full-slider">
                    <img src="{$WEB_ROOT}/templates/{$template}/assets/img/topbanner01.jpg" alt="Web Hosting"/>
                </div>
            </div>
            
            <!-- 3 Slider -->
            <div class="carousel-cell sec-bg6 bg-colorstyle">
                <div class="slider-content">
                    <div class="container ">
                        <img class="svg custom-element-right" src="{$WEB_ROOT}/templates/{$template}/assets/patterns/rack.svg" alt="Hosting Package">
                        <div class="col-sm-12 col-md-6 px-0">
                            <h1 class="mergecolor" data-aos="fade-up" data-aos-duration="800">Pachete de <br>Găzduire</h1>
                            <p class="text-break seccolor" data-aos="fade-up" data-aos-duration="1200">{$LANG.cloudSlider.feature01DescriptionTwo}</p>
                            <a href="{$WEB_ROOT}/cart.php?gid=1" class="btn btn-default-yellow-fill me-2">{$LANG.ordernowbutton} <i class="fas fa-cart-plus ps-1 f-15"></i></a>
                            <a href="{$WEB_ROOT}/cart.php?gid=1" class="btn btn-default-pink-fill">{$LANG.learnmore}</a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 4 Slider -->
            <div class="carousel-cell sec-bg6 bg-colorstyle">
                <div class="slider-content">
                    <div class="container ">
                        <img class="svg custom-element-right" src="{$WEB_ROOT}/templates/{$template}/assets/patterns/monitoring.svg" alt="Support Requests">
                        <div class="col-sm-12 col-md-6 px-0">
                            <h1 class="mergecolor" data-aos="fade-up" data-aos-duration="800">{$LANG.homepage.supportRequests}</h1>
                            <p class="text-break seccolor" data-aos="fade-up" data-aos-duration="1200">{$LANG.cloudSlider.feature02DescriptionTwo}</p>
                            <a href="contact.php" class="btn btn-default-yellow-fill me-2">{$LANG.domainContactUs} <i class="fa-solid fa-headset"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</div>

<script>
var typed1 = new Typed('#typed1', {
  strings: ["performanță.", "flexibilitate.", "scalabilitate."],
  typeSpeed: 50,
  backSpeed: 20,
  smartBackspace: true,
  loop: true
});
</script>