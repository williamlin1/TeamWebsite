import webapp2
from google.appengine.api import urlfetch
from urllib import urlencode
import json
import random
import string
import jinja2
import os
from google.appengine.api import memcache
import logging
from google.appengine.ext import db
from google.appengine.api import images
import base64
import time

template_dir = os.path.join(os.path.dirname(__file__),'templates')
jinja_env = jinja2.Environment(loader= jinja2.FileSystemLoader(template_dir), autoescape = True)


def write(handler, *a, **kw):
    handler.response.out.write(*a, **kw)

def render_str(template, **params):
    t = jinja_env.get_template(template)
    return t.render(params)
    
def render(handler, template, **kw):
    write(handler, render_str(template,**kw))

    
class Home(webapp2.RequestHandler):
    def get(self):
        render(self, "Home.html");

class aboutTeam(webapp2.RequestHandler):
    def get(self):
        render(self, "AboutTeam.html");        

class sponsors(webapp2.RequestHandler):
    def get(self):
        render(self, "Sponsors.html");  

class contactUs(webapp2.RequestHandler):
    def get(self):
        render(self, "Contact.html");  

class outreach(webapp2.RequestHandler):
    def get(self):
        render(self, "Outreach.html");        


application = webapp2.WSGIApplication([
    ('/', Home),
    ('/Home', Home),
    ('/AboutTeam', aboutTeam),
    ('/Sponsors', sponsors),
    ('/ContactUs', contactUs),
    ('/Outreach', outreach),
], debug=False)
