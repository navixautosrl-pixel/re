{if $loginpage eq 0 and $templatefile ne "clientregister"}<!-- login and register page without the default header and footer -->
                                        </div><!-- /.main-content -->
                                    <div class="clearfix"></div>
                                </div><!-- end row -->
                            </div><!-- end container -->
                        </section><!-- end main body section -->
                    </div><!-- end page wrapper -->
                </div><!-- end main body -->
            </div><!-- end inner content -->
        </div><!-- end content -->
    </div><!-- end wrapper -->
</div><!-- end main container -->

{if $loggedin}<span id="gravataremail" class="hidden">{$clientsdetails.email}</span><!-- gravatar email -->{/if}
<div id="fullpage-overlay" class="hidden">
    <div class="outer-wrapper">
        <div class="inner-wrapper">
            <img src="{$WEB_ROOT}/assets/img/overlay-spinner.svg">
            <br>
            <span class="msg"></span>
        </div>
    </div>
</div>

<!--
*******************
FOOTER
*******************
-->
<footer id="footer" class="footer">
  {include file="$template/includes/verifyemail.tpl"}
  <img class="logo-bg logo-footer" src="{$WEB_ROOT}/templates/{$template}/assets/img/symbol.svg" alt="symbol">
  <div class="container">
    <div class="footer-top">
      <div class="row">
        <div class="col-sm-6 col-md-3">
          <div class="heading">Hosting</div>
          <ul class="footer-menu classic">
            <li class="menu-item"><a href="{$WEB_ROOT}/cart.php?gid=1">Găzduire Web</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/cart.php?gid=3">Server Dedicat</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/cart.php?gid=4">VPS Cloud</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/cart.php?a=add&domain=register">Domenii</a></li>
          </ul>
        </div>
        <div class="col-sm-6 col-md-3">
          <div class="heading">Suport</div>
          <ul class="footer-menu classic">
            <li class="menu-item"><a href="{$WEB_ROOT}/login">Contul Meu</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/knowledgebase">Bază de cunoștințe</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/contact.php">Contact</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/submitticket.php">Deschide un tichet</a></li>
          </ul>
        </div>
        <div class="col-sm-6 col-md-3">
          <div class="heading">Companie</div>
          <ul class="footer-menu classic">
            <li class="menu-item"><a href="{$WEB_ROOT}/contact.php">Despre Noi</a> </li>
            <li class="menu-item"><a href="{$WEB_ROOT}/announcements">Anunțuri</a></li>
            <li class="menu-item"><a href="{$WEB_ROOT}/contact.php">Contact</a></li>
          </ul>
        </div>
        <div class="col-sm-6 col-md-3">
          <a href="https://robixhost.ro/"><img class="svg logo-footer d-block" src="{$WEB_ROOT}/templates/{$template}/assets/img/logo-robixhost.webp" alt="logo {$companyname}"></a>
          <a href="https://robixhost.ro/"><img class="svg logo-footer d-none" src="{$WEB_ROOT}/templates/{$template}/assets/img/logo-robixhost.webp" alt="logo {$companyname}"></a>
          <div class="copyright">{lang key="copyrightFooterNotice" year=$date_year company=$companyname}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="subcribe news">
    <div class="container">
      <div class="row">
        <form action="#" class="w-100"><!-- TODO: RobixHost - conecteaza acest formular la un serviciu de newsletter (Mailchimp etc.) sau elimina-l -->
          <div class="col-md-6 col-md-offset-3">
            <div class="general-input">
              <input type="email" name="email" placeholder="Adresa ta de email" class="fill-input">
              <input type="submit" value="ABONEAZĂ-TE" class="btn btn-subscribe btn-default-yellow-fill initial-transform">
            </div>
          </div>
          <div class="col-md-6 col-md-offset-3 text-center pt-4">
            <p>Abonează-te la newsletter pentru noutăți și oferte</p>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <div class="row">
        <div class="col-md-6 col-lg-6">          
          <ul class="footer-menu">
            <li class="menu-item by ml-0">&copy; {$date_year} {$companyname}. Toate drepturile rezervate.</li>
          </ul>
        </div>
        <div class="col-md-6 col-lg-6">
          <ul class="payment-list">
            <li><p>Metode de plată acceptate</p></li><!-- TODO: RobixHost - pastreaza doar iconitele metodelor de plata pe care le ai activate in WHMCS -->
            <li><i class="fab fa-cc-paypal"></i></li>
            <li><i class="fab fa-cc-visa"></i></li>
            <li><i class="fab fa-cc-mastercard"></i></li>
            <li><i class="fab fa-cc-apple-pay"></i></li>
            <li><i class="fab fa-cc-discover"></i></li>
            <li><i class="fab fa-cc-amazon-pay"></i></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</footer>

<div class="modal system-modal fade" id="modalAjax" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content panel panel-primary">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                    <span class="sr-only">Close</span>
                    <span class="sr-only">{$LANG.close}</span>
                </button>
                <h4 class="modal-title">Title</h4>
            </div>
            <div class="modal-body panel-body">
                Loading...
                {$LANG.loading}
            </div>
            <div class="modal-footer panel-footer">
                <div class="pull-left loader">
                    <i class="fas fa-circle-notch fa-spin"></i> Loading...
                </div>
                <button type="button" class="btn btn-default" data-dismiss="modal">
                    Close
                    {$LANG.close}
                </button>
                <button type="button" class="btn btn-primary modal-submit">
                    Submit
                    {$LANG.submit}
                </button>
            </div>
        </div>
    </div>
</div>
{/if}

{include file="$template/includes/generate-password.tpl"}
{$footeroutput}

<script>
 if ($("p:contains('Powered by')").length) {
 $("p:contains('Powered by')").hide();
 }
</script>

</body>
</html>
